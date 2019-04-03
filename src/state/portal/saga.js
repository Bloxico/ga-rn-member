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

export function* fetchBattery$({ payload: { user } }: any): Generator<*, *, *> {
  try {
    const emailEscaped = user.email.replace(/[.]/g, ',') || '';

    let batteryList = [];

    yield firebase
      .database()
      .ref(`/users/${emailEscaped}`)
      .once(
        'value',
        snapshot => {
          if (snapshot && snapshot.val().batteryLevel)
            batteryList = snapshot.val().batteryLevel;

          put(actions.fetchBatterySuccess({ batteryList }));
        },
        () => {
          // TODO@tolja implement error
        },
      );

    yield put(actions.fetchBatterySuccess({ batteryList }));
  } catch (error) {
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

  yield firebase
    .database()
    .ref(`/users/${emailEscaped}`)
    .once(
      'value',
      snapshot => {
        let { batteryLevel } = snapshot.val();

        if (batteryLevel)
          batteryLevel.push({
            level,
            isCharging,
            time: new Date(),
            isBackground,
          });
        else batteryLevel = [{ level, isCharging }];

        firebase
          .database()
          .ref(`/users`)
          .child(`${emailEscaped}`)
          .update({ batteryLevel })
          .then(() => {
            if (isBackground)
              BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);

            if (notification)
              notification.finish('backgroundFetchResultNewData');
          })
          .catch(() => {
            // TODO@tolja error to implement
          });
      },
      () => {
        // TODO@tolja implement error
      },
    );
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
  // yield fork(startListener);
}
