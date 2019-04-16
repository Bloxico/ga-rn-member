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
    const emailEscaped = user.email.replace(/[.]/g, ',') || '';

    let batteryList = [];
    let rewards = [];

    const batteryLevelRef = firebase
      .database()
      .ref(`/users/${emailEscaped}/batteryLevel`);

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
    const latestEvent = { level, isCharging, time: new Date().toJSON() };
    yield batteryList.push(latestEvent);
    console.log(1,batteryList);
    const a = yield batteryList.reduce((re, obj) => {
      if (!Array.isArray(re) || !re.length) {
        re.push({
          time: obj.time,
          points: 0,
          reward: 0,
          stepReward: 0,
          percentTillReward: 0,
          rewardPreventedTime: obj.time,
          level: obj.level,
          timeTillRewarded: 540,
        });
      } else {
        const oldDate = new Date(re[0].time);

        const curDate = new Date(obj.time);

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

        re[0].time = obj.time;
        re[0].points += points;
        const prevLevel = re[0].level;
        re[0].level = obj.level;
        let currPoints = re[0].points;

        let reward = 0;
        let perToReward = 0;
        let timeTillRewarded = 540;

        if (points > 720 || obj.level > prevLevel) currPoints -= points;
        if (points < 0) currPoints += points;
        // TODO@tolja put this in for loop and constants, so it's more readable
        if (currPoints > 0) {
          if (currPoints < 540) {
            perToReward = currPoints / 540;
            timeTillRewarded = 540 - currPoints;
          } else if (currPoints >= 540 && currPoints < 1020) {
            ++reward;
            perToReward = (currPoints - 540) / 480;
            timeTillRewarded = 1020 - currPoints;
          } else if (currPoints >= 1020 && currPoints < 1470) {
            reward += 2;
            perToReward = (currPoints - 1020) / 450;
            timeTillRewarded = 1470 - currPoints;
          } else if (currPoints >= 1470 && currPoints < 1890) {
            reward += 3;
            perToReward = (currPoints - 1470) / 420;
            timeTillRewarded = 1890 - currPoints;
          } else if (currPoints >= 1890 && currPoints < 2280) {
            reward += 4;
            perToReward = (currPoints - 1890) / 390;
            timeTillRewarded = 2280 - currPoints;
          } else if (currPoints >= 2280 && currPoints < 2640) {
            reward += 5;
            perToReward = (currPoints - 2280) / 360;
            timeTillRewarded = 2640 - currPoints;
          } else if (currPoints >= 2640 && currPoints < 2970) {
            reward += 6;
            perToReward = (currPoints - 2640) / 330;
            timeTillRewarded = 2970 - currPoints;
          } else if (currPoints >= 2970 && currPoints < 3270) {
            reward += 7;
            perToReward = (currPoints - 2970) / 300;
            timeTillRewarded = 3270 - currPoints;
          } else if (currPoints >= 3270 && currPoints < 3540) {
            reward += 8;
            perToReward = (currPoints - 3270) / 270;
            timeTillRewarded = 3540 - currPoints;
          } else if (currPoints >= 3540 && currPoints < 3780) {
            reward += 9;
            perToReward = (currPoints - 3540) / 240;
            timeTillRewarded = 3780 - currPoints;
          } else if (currPoints >= 3780 && currPoints < 3960) {
            reward += 10;
            perToReward = (currPoints - 3780) / 210;
            timeTillRewarded = 3960 - currPoints;
          } else if (currPoints >= 3960 && currPoints < 4110) {
            reward += 11;
            perToReward = (currPoints - 3960) / 180;
            timeTillRewarded = 4110 - currPoints;
          } else if (currPoints >= 4110 && currPoints < 4230) {
            reward += 12;
            perToReward = (currPoints - 4110) / 150;
            timeTillRewarded = 4230 - currPoints;
          } else if (currPoints >= 4230 && currPoints < 4290) {
            reward += 13;
            perToReward = (currPoints - 4230) / 120;
            timeTillRewarded = 4290 - currPoints;
          } else if (currPoints >= 4290 && currPoints < 4320) {
            reward += 14;
            perToReward = (currPoints - 4290) / 90;
            timeTillRewarded = 4320 - currPoints;
          } else if (currPoints > 4320) {
            reward += 15;
            perToReward = 1;
          }
        }

        if (reward > 0) {
          re[0].stepReward = reward;
        }

        re[0].percentTillReward = perToReward * 100;
        re[0].timeTillRewarded = timeTillRewarded;

        if (
          points > 720 ||
          obj.isCharging ||
          obj.level > prevLevel ||
          points < 0
        ) {
          re[0].points = 0;
          re[0].percentTillReward = 0;
          re[0].timeTillRewarded = 540;

          if (reward > 0) {
            re[0].reward += reward;

            firebase
              .database()
              .ref(`/users/${emailEscaped}`)
              .child('rewards')
              .push({ reward, time: obj.time });
          }

          re[0].rewardPreventedTime = obj.time;
        }
      }
      if (batteryList.length < 2) re[0].timeTillRewarded = 540;
      return re;
    }, []);

    const newBatteryList = yield batteryList.filter(
      o => new Date(o.time) >= new Date(a[0].rewardPreventedTime),
    );
    yield firebase
      .database()
      .ref(`/users/${emailEscaped}`)
      .child('batteryLevel')
      .set(newBatteryList);

    yield firebase
      .database()
      .ref(`/users/${emailEscaped}`)
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
    console.log(55, newBatteryList, sumRewards, a[0].stepReward, a[0].percentTillReward, a[0].timeTillRewarded);
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
    const emailEscaped = user.email.replace(/[.]/g, ',') || '';

    yield firebase
      .database()
      .ref(`/users`)
      .child(`${emailEscaped}`)
      .update({ pushToken: token.token });
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* addBattery$({
  payload: { level, isCharging, user, isBackground, notification },
}: any): Generator<*, *, *> {
  const emailEscaped = user.email.replace(/[.]/g, ',') || '';

  const batteryLevel = {
    level,
    isCharging,
    time: new Date(),
    isBackground,
  };

  yield firebase
    .database()
    .ref(`/users/${emailEscaped}`)
    .child(`batteryLevel`)
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
    const emailEscaped = user.email.replace(/[.]/g, ',');

    yield firebase
      .database()
      .ref(`/users/${emailEscaped}`)
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
                      .ref(`/users/${emailEscaped}`)
                      .set({
                        email: user.email,
                        name: user.name,
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
