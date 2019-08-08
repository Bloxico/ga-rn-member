// @flow

import { all, takeEvery, takeLatest, put } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import base64 from 'react-native-base64';
import { Linking } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-community/async-storage';

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
  payload: { level, isCharging, user, events },
}: any): Generator<*, *, *> {
  try {
    let batteryList = [];
    let { deviceId } = user;

    if (!user.devideId) {
      deviceId = yield AsyncStorage.getItem('@DeviceId');
    }

    let storageReward = yield AsyncStorage.getItem('@CollectingReward');

    if (events.length > 0) {
      batteryList = events;
    } else {
      const batteryLevelRef = firebase
        .database()
        .ref(`/users/${user.uid}/devices/${deviceId}`);

      batteryLevelRef.keepSynced(true);

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
    }

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
              .ref(`/users/${user.uid}/devices/${deviceId}`)
              .child('current_reward')
              .once(
                'value',
                snapshot => {
                  if (snapshot.val()) {
                    let updatedReward = snapshot.val().reward + reward;
                    if (storageReward)
                      storageReward = JSON.parse(storageReward);

                    if (
                      storageReward &&
                      storageReward.id === user.deviceId &&
                      storageReward.email === user.email &&
                      storageReward.currentLevel > 0 &&
                      storageReward.rewardTime >=
                        new Date(events[0].timestamp).getTime()
                    )
                      updatedReward -= REWARD_SUM[storageReward.currentLevel];
                    if (updatedReward < 0) updatedReward = 0;

                    firebase
                      .database()
                      .ref(`/users/${user.uid}/devices/${deviceId}`)
                      .child('current_reward')
                      .update({ reward: updatedReward });
                  } else {
                    firebase
                      .database()
                      .ref(`/users/${user.uid}/devices/${deviceId}`)
                      .child('current_reward')
                      .set({
                        reward,
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
      .ref(`/users/${user.uid}/devices/${deviceId}`)
      .child('events')
      .set(newBatteryList);

    const stepReward = newBatteryList[newBatteryList.length - 1].chargingStatus
      ? 0
      : a[0].stepReward;

    yield put(
      actions.fetchBatterySuccess({
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
  payload: { currentLevel, user, reward },
}: any): Generator<*, *, *> {
  try {
    const rewardTime = new Date().getTime();

    yield firebase
      .database()
      .ref(`/users/${user.uid}/devices/${user.deviceId}`)
      .child('current_reward')
      .set({
        claimable: true,
        currentLevel,
        timestamp: rewardTime,
        reward,
        email: user.email,
        error: false,
      });

    const storageReward = {
      rewardTime,
      currentLevel,
      id: user.deviceId,
      email: user.email,
    };

    yield AsyncStorage.setItem(
      '@CollectingReward',
      JSON.stringify(storageReward),
    );

    yield put(
      actions.claimRewardsSuccess({
        toClaimReward: 0,
      }),
    );
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* pushToken$({ payload: { token } }: any): Generator<*, *, *> {
  try {
    const oldToken = yield AsyncStorage.getItem('@DevicePushToken');

    if (!oldToken && oldToken !== token) {
      yield AsyncStorage.setItem('@DevicePushToken', token);

      yield firebase
        .database()
        .ref(`/pushKeys`)
        .push({ pushToken: token });
    }
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* addBattery$({
  payload: { batteryLevel, isCharging, user, isBackground, notification },
}: any): Generator<*, *, *> {
  let { deviceId } = user;

  if (!deviceId) {
    deviceId = yield AsyncStorage.getItem('@DeviceId');
  }

  const batteryLevelRef = firebase
    .database()
    .ref(`/users/${user.uid}/devices/${deviceId}`);

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

  const batteryObject = {
    currentPercentage: batteryLevel,
    chargingStatus: isCharging,
    timestamp: new Date(),
    notification,
  };

  batteryList.push(batteryObject);

  yield firebase
    .database()
    .ref(`/users/${user.uid}/devices/${deviceId}`)
    .child('events')
    .set(batteryList)
    .then(() => {
      if (isBackground)
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
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
          // console.log(user, token);
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
                  .catch(error => {
                    // console.log(error.response);
                    firebase
                      .database()
                      .ref(`/users/${user.uid}`)
                      .child('info')
                      .update({
                        requiresToken: true,
                      });
                    // TODO@tolja implement error
                  });
              });
        },
        () => {
          // TODO@tolja implement error
        },
      );

    const { email } = user;

    yield AsyncStorage.setItem(
      '@DeviceConnectedEmail',
      JSON.stringify({ deviceConnected: { email, connected: true } }),
    );

    yield put(actions.ecdRedirectSuccess({ userIntegrated: true }));
  } catch (error) {
    yield put(actions.ecdRedirectFail());
  }
}

export function* isIntegrated$({
  payload: { user, integrate = false },
}: any): Generator<*, *, *> {
  try {
    const { email } = user;
    let deviceEmail = yield AsyncStorage.getItem('@DeviceConnectedEmail');

    if (!deviceEmail) {
      deviceEmail = JSON.stringify({
        deviceConnected: { email, connected: integrate },
      });
    }

    if (integrate)
      yield AsyncStorage.setItem(
        '@DeviceConnectedEmail',
        JSON.stringify(deviceEmail),
      );

    const { deviceConnected } = JSON.parse(deviceEmail);
    let userIntegrated = false;

    if (deviceConnected && deviceConnected.email === email) {
      userIntegrated = deviceConnected.connected;
    }
    yield put(actions.ecdConnectedSuccess({ userIntegrated }));
  } catch (error) {
    // TODO@tolja implement error
  }
}

// $FlowIssue
export default function*() {
  yield all([takeEvery(actions.ECD_REDIRECT, ecdRedirect$)]);
  yield all([takeEvery(actions.BATTERY, addBattery$)]);
  yield all([takeLatest(actions.BATTERY_FETCH, fetchBattery$)]);
  yield all([takeEvery(actions.PUSH_TOKEN, pushToken$)]);
  yield all([takeEvery(actions.CLAIM_REWARDS, claimReward$)]);
  yield all([takeEvery(actions.ECD_CONNECTED, isIntegrated$)]);
}
