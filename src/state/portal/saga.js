// @flow

import { all, takeEvery, takeLatest, put } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import base64 from 'react-native-base64';
import { Linking } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';

import {
  CLIENT_ID,
  CLIENT_PASS,
  ECD_LINK,
  REWARD_STEPS,
  REWARD_SUM,
  // $FlowIssue
} from '@constants';
// $FlowIssue
import http from '@http';

import * as actions from './actions';

export function* fetchBattery$({
  payload: { level, isCharging, user },
}: any): Generator<*, *, *> {
  try {
    let batteryList = [];
    let sumRewards = 0;
    let currentReward = 0;
    let lastClaim;

    const batteryLevelRef = firebase
      .database()
      .ref(`/users/${user.uid}/devices/${user.id}`);

    batteryLevelRef.keepSynced(true);

    yield batteryLevelRef.once(
      'value',
      snapshot => {
        snapshot.val().events.forEach(val => {
          batteryList.push(val);
        });

        if (snapshot.child('current_reward').exists()) {
          currentReward = snapshot.val().current_reward.reward;
        }

        if (snapshot.child('claim_ios').exists()) {
          lastClaim = snapshot.val().claim_ios;
        }

        sumRewards = snapshot.val().sum_rewards;
      },
      () => {
        // TODO@tolja implement error
      },
    );

    const latestEvent = {
      currentPercentage: level,
      chargingStatus: isCharging,
      timestamp: new Date().toJSON(),
    };

    batteryList.push(latestEvent);

    const a = yield batteryList.reduce((re, obj) => {
      if (!Array.isArray(re) || !re.length) {
        re.push({
          time: obj.timestamp,
          isCharging: obj.chargingStatus,
          points: 0,
          reward: 0,
          stepReward: 0,
          percentTillReward: 0,
          rewardPreventedTime: obj.timestamp,
          level: obj.currentPercentage,
          timeTillRewarded: REWARD_STEPS[0] * 60,
        });
      } else {
        const oldDate = new Date(re[0].time);

        const curDate = new Date(obj.timestamp);

        const utcPrev = Date.UTC(
          oldDate.getFullYear(),
          oldDate.getMonth(),
          oldDate.getDate(),
          oldDate.getHours(),
          oldDate.getMinutes(),
          oldDate.getSeconds(),
          oldDate.getMilliseconds(),
        );

        const utcCurrent = Date.UTC(
          curDate.getFullYear(),
          curDate.getMonth(),
          curDate.getDate(),
          curDate.getHours(),
          curDate.getMinutes(),
          curDate.getSeconds(),
          curDate.getMilliseconds(),
        );

        const points = (utcCurrent - utcPrev) / (1000 * 60);

        re[0].time = obj.timestamp;
        re[0].points += points;
        const prevLevel = re[0].level;
        re[0].level = obj.currentPercentage;
        let currPoints = re[0].points;
        const prevChargeStatus = re[0].isCharging;
        re[0].isCharging = obj.chargingStatus;

        let reward = 0;
        let stepReward = 0;
        let perToReward = 0;
        let timeTillRewarded = REWARD_STEPS[0] * 60;

        if (
          points > 720 ||
          obj.currentPercentage > prevLevel ||
          (obj.chargingStatus && prevChargeStatus)
        )
          currPoints -= points;
        if (points < 0) currPoints += points;

        REWARD_STEPS.reduce((pointsSum, currPeriod, index) => {
          let prevSum = pointsSum;
          let currPeriodMinutes = currPeriod * 60;
          pointsSum = parseFloat((pointsSum + currPeriodMinutes).toFixed(2));

          if (pointsSum >= currPoints && currPoints > prevSum && reward === 0) {
            // TODO@tolja optimizovati petlju i reduce
            reward = REWARD_SUM[index];
            stepReward = index;
            perToReward = (currPoints - prevSum) / (pointsSum - prevSum);
            timeTillRewarded = pointsSum - currPoints;
          } else if (
            index === REWARD_STEPS.length - 1 &&
            currPoints > pointsSum
          ) {
            reward = REWARD_SUM[REWARD_STEPS.length];
            stepReward = REWARD_STEPS.length;
            timeTillRewarded = 0;
          }

          return pointsSum;
        }, 0);

        if (reward > 0) {
          re[0].stepReward = stepReward;
        }

        re[0].percentTillReward = perToReward * 100;
        re[0].timeTillRewarded = timeTillRewarded;

        if (
          points > 720 ||
          obj.chargingStatus ||
          obj.currentPercentage > prevLevel ||
          points < 0
        ) {
          re[0].points = 0;
          re[0].percentTillReward = 0;
          re[0].timeTillRewarded = REWARD_STEPS[0] * 60;

          if (reward > 0) {
            re[0].reward += reward;
            firebase
              .database()
              .ref(`/users/${user.uid}/devices/${user.id}`)
              .child('current_reward')
              .once(
                'value',
                snapshot => {
                  if (snapshot.val()) {
                    const currentReward = snapshot.val().reward + reward;

                    firebase
                      .database()
                      .ref(`/users/${user.uid}/devices/${user.id}`)
                      .child('current_reward')
                      .update({ reward: currentReward });
                  } else {
                    firebase
                      .database()
                      .ref(`/users/${user.uid}/devices/${user.id}`)
                      .child('current_reward')
                      .set({
                        reward: reward,
                        timestamp: new Date().getTime(),
                        email: user.email,
                      });
                  }
                },
                () => {
                  // TODO@tolja implement error
                },
              );
          }

          re[0].rewardPreventedTime = obj.timestamp;
          firebase
            .database()
            .ref(`/users/${user.uid}/devices/${user.id}/claim_ios`)
            .child('timestamps')
            .push({ time: batteryList[0].timestamp });
        }
      }
      if (batteryList.length < 2) re[0].timeTillRewarded = REWARD_STEPS[0] * 60;
      return re;
    }, []);

    const newBatteryList = yield batteryList.filter(
      o => new Date(o.timestamp) >= new Date(a[0].rewardPreventedTime),
    );

    yield firebase
      .database()
      .ref(`/users/${user.uid}/devices/${user.id}`)
      .child('events')
      .set(newBatteryList);

    let timestamp = batteryList[0].timestamp;

    if (
      lastClaim &&
      lastClaim.timestamps &&
      !(new Date(lastClaim.time) >= new Date(timestamp))
    ) {
      timestamp = Object.values(lastClaim.timestamps).sort(function(a, b) {
        return new Date(a.time) - new Date(b.time);
      })[0].time;
    }

    if (lastClaim && new Date(lastClaim.time) >= new Date(timestamp)) {
      if (a[0].stepReward === 0) {
        currentReward -= REWARD_SUM[lastClaim.currentLevel];
      } else
        currentReward =
          currentReward +
          REWARD_SUM[a[0].stepReward] -
          REWARD_SUM[lastClaim.currentLevel];
    } else {
      currentReward += REWARD_SUM[a[0].stepReward];
    }

    const stepReward = newBatteryList[newBatteryList.length - 1].chargingStatus
      ? 0
      : a[0].stepReward;

    yield put(
      actions.fetchBatterySuccess({
        // batteryList: newBatteryList,
        reward: sumRewards,
        toClaimReward: currentReward,
        stepReward,
        percentTillRewarded: a[0].percentTillReward,
        timeTillRewarded: a[0].timeTillRewarded,
      }),
    );
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* claimReward$({
  payload: { reward, currentLevel, user, sumReward },
}: any): Generator<*, *, *> {
  try {
    yield firebase
      .database()
      .ref(`/users/${user.uid}/devices/${user.id}`)
      .child('current_reward')
      .set({
        reward: reward,
        timestamp: new Date().getTime(),
        email: user.email,
        claimable: true,
      });

    yield firebase
      .database()
      .ref(`/users/${user.uid}/devices/${user.id}`)
      .child('claim_ios')
      .set({ currentLevel, time: new Date(), reward });

    yield put(
      actions.claimRewardsSuccess({
        reward: sumReward + reward,
        toClaimReward: 0,
      }),
    );
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* pushToken$({ payload: { token } }: any): Generator<*, *, *> {
  try {
    yield firebase
      .database()
      .ref(`/pushKeys`)
      .push({ pushToken: token.token });
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* addBattery$({
  payload: { level, isCharging, user, isBackground, notification },
}: any): Generator<*, *, *> {
  const batteryLevelRef = firebase
    .database()
    .ref(`/users/${user.uid}/devices/${user.id}`);

  batteryLevelRef.keepSynced(true);

  let batteryList = [];

  yield batteryLevelRef.once(
    'value',
    snapshot => {
      snapshot.val().events.forEach(val => {
        batteryList.push(val);
      });
    },
    () => {
      // TODO@tolja implement error
    },
  );

  const batteryLevel = {
    currentPercentage: level,
    chargingStatus: isCharging,
    timestamp: new Date(),
  };

  batteryList.push(batteryLevel);

  yield firebase
    .database()
    .ref(`/users/${user.uid}/devices/${user.id}`)
    .child('events')
    .set(batteryList)
    .then(() => {
      if (isBackground)
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);

      if (notification) notification.finish('backgroundFetchResultNewData');
    })
    .catch(() => {
      // TODO@tolja error to implement
    });
}

export function* ecdRedirect$({ payload: { user } }: any): Generator<*, *, *> {
  try {
    yield firebase
      .database()
      .ref(`/users/${user.uid}`)
      .child('info')
      .once(
        'value',
        snapshot => {
          const token = snapshot.val();

          const params = {
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          };

          if (token)
            http
              .post(`oauth/check_token?token=${token.accessToken}`, null, {
                headers: {
                  Authorization: `Basic ${base64.encode(
                    `${CLIENT_ID}:${CLIENT_PASS}`,
                  )}`,
                },
              })
              .then(() => {
                Linking.openURL(`${ECD_LINK}auth?token=${token.accessToken}`);
              })
              .catch(() => {
                http
                  .post(
                    'oauth/token',
                    Object.keys(params)
                      .map(key => `${key}=${encodeURIComponent(params[key])}`)
                      .join('&'),
                    {
                      auth: {
                        username: `${CLIENT_ID}`,
                        password: `${CLIENT_PASS}`,
                      },
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                    },
                  )
                  .then(response => {
                    Linking.openURL(
                      `${ECD_LINK}auth?token=${response.data.access_token}`,
                    );

                    const { data } = response;

                    firebase
                      .database()
                      .ref(`/users/${user.uid}`)
                      .child('info')
                      .update({
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                      });
                  })
                  .catch(() => {
                    // TODO@tolja implement error
                  });
              });
        },
        () => {
          // TODO@tolja implement error
        },
      );
  } catch (error) {
    yield put(actions.ecdRedirectFail());
  }
}

// $FlowIssue
export default function*() {
  yield all([takeEvery(actions.ECD_REDIRECT, ecdRedirect$)]);
  yield all([takeEvery(actions.BATTERY, addBattery$)]);
  yield all([takeLatest(actions.BATTERY_FETCH, fetchBattery$)]);
  yield all([takeEvery(actions.PUSH_TOKEN, pushToken$)]);
  yield all([takeEvery(actions.CLAIM_REWARDS, claimReward$)]);
}
