// @flow

import { all, takeEvery, put } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import base64 from 'react-native-base64';
import { Linking } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
// $FlowIssue
import { CLIENT_ID, CLIENT_PASS, ECD_LINK } from '@constants';
// $FlowIssue
import http from '@http';

import * as actions from './actions';

export function* fetchBattery$({
  payload: { level, isCharging, user },
}: any): Generator<*, *, *> {
  try {
    let batteryList = [];
    let rewards = [];

    const batteryLevelRef = firebase
      .database()
      .ref(`/users/${user.uid}/events`);

    batteryLevelRef.keepSynced(true);

    yield batteryLevelRef.once(
      'value',
      snapshot => {
        snapshot.forEach(snapshotChild => {
          batteryList.push(snapshotChild.val());
        });
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
      const rewardSteps = [6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1];

      if (!Array.isArray(re) || !re.length) {
        re.push({
          time: obj.timestamp,
          points: 0,
          reward: 0,
          stepReward: 0,
          percentTillReward: 0,
          rewardPreventedTime: obj.timestamp,
          level: obj.currentPercentage,
          timeTillRewarded: rewardSteps[0] * 60,
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
        );

        const utcCurrent = Date.UTC(
          curDate.getFullYear(),
          curDate.getMonth(),
          curDate.getDate(),
          curDate.getHours(),
          curDate.getMinutes(),
          curDate.getSeconds(),
        );

        const points = (utcCurrent - utcPrev) / (1000 * 60);

        re[0].time = obj.timestamp;
        re[0].points += points;
        const prevLevel = re[0].level;
        re[0].level = obj.currentPercentage;
        let currPoints = re[0].points;

        let reward = 0;
        let perToReward = 0;
        let timeTillRewarded = rewardSteps[0] * 60;

        if (points > 720 || obj.currentPercentage > prevLevel) currPoints -= points;
        if (points < 0) currPoints += points;

        rewardSteps.reduce((pointsSum, currPeriod, index) => {
          let prevSum = pointsSum;
          let currPeriodMinutes = currPeriod * 60;
          pointsSum += currPeriodMinutes;

          if (pointsSum > currPoints && currPoints > prevSum && reward === 0) {
            reward = index;
            perToReward = (currPoints - prevSum) / (pointsSum - prevSum);
            timeTillRewarded = pointsSum - currPoints;
          } else if (
            index === rewardSteps.length - 1 &&
            currPoints > pointsSum
          ) {
            reward = rewardSteps.length;
            timeTillRewarded = 0;
          }

          return pointsSum;
        }, 0);

        if (reward > 0) {
          re[0].stepReward = reward;
        }

        re[0].percentTillReward = perToReward * 100;
        re[0].timeTillRewarded = timeTillRewarded;

        if (
          points > 720 ||
          obj.isCharging ||
          obj.currentPercentage > prevLevel ||
          points < 0
        ) {
          re[0].points = 0;
          re[0].percentTillReward = 0;
          re[0].timeTillRewarded = rewardSteps[0] * 60;

          if (reward > 0) {
            re[0].reward += reward;

            firebase
              .database()
              .ref(`/rewards`)
              .push({
                stopOrder: reward,
                reward,
                timestamp: obj.timestamp,
                uid: user.uid,
                deviceId: user.id,
                email: user.email,
                totalOrder: rewardSteps.length,
                storedInECD: false,
              });
          }

          re[0].rewardPreventedTime = obj.timestamp;
        }
      }
      if (batteryList.length < 2) re[0].timeTillRewarded = rewardSteps[0] * 60;
      return re;
    }, []);

    const newBatteryList = yield batteryList.filter(
      o => new Date(o.timestamp) >= new Date(a[0].rewardPreventedTime),
    );

    yield firebase
      .database()
      .ref(`/users`)
      .child(user.uid)
      .child('events')
      .set(newBatteryList);

    yield firebase
      .database()
      .ref(`/users/${user.uid}`)
      .child('rewards')
      .once(
        'value',
        snapshot => {
          snapshot.forEach(snapshotChild => {
            rewards.push(snapshotChild.val());
          });
        },
        () => {
          // TODO@tolja implement error
        },
      );

    const sumRewards = rewards
      .map(item => item.reward)
      .reduce((prev, next) => prev + next, 0);
    console.log(
      55,
      newBatteryList,
      sumRewards,
      a[0].stepReward,
      a[0].percentTillReward,
      a[0].timeTillRewarded,
    );
    yield put(
      actions.fetchBatterySuccess({
        batteryList: newBatteryList,
        reward: sumRewards,
        stepReward: a[0].stepReward,
        percentTillRewarded: a[0].percentTillReward,
        timeTillRewarded: a[0].timeTillRewarded,
      }),
    );
  } catch (error) {
    console.log(error);
    // TODO@tolja implement error
  }
}

export function* pushToken$({
  payload: { token, user },
}: any): Generator<*, *, *> {
  try {
    yield firebase
      .database()
      .ref(`/users/${user.uid}`)
      .child(`info`)
      .update({ pushToken: token.token });
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* addBattery$({
  payload: { level, isCharging, user, isBackground, notification },
}: any): Generator<*, *, *> {
  const batteryLevel = {
    currentPercentage: level,
    chargingStatus: isCharging,
    timestamp: new Date(),
  };

  yield firebase
    .database()
    .ref(`/users/${user.uid}`)
    .child(`events`)
    .push({ ...batteryLevel })
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
  yield all([takeEvery(actions.BATTERY_FETCH, fetchBattery$)]);
  yield all([takeEvery(actions.PUSH_TOKEN, pushToken$)]);
}
