// @flow

import { all, takeEvery, put, fork, take } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';
import base64 from 'react-native-base64';
import { Linking, Alert } from 'react-native';

// $FlowIssue
import { CLIENT_ID, CLIENT_PASS, ECD_LINK } from '@constants';
// $FlowIssue
import http from '@http';

import * as actions from './actions';

// function* startListener() {
//   // #1: Creates an eventChannel and starts the listener;
//   const channel = new eventChannel(emiter => {
//     const listener = firebase
//       .database()
//       .ref(`/users/${emailEscaped}`)
//       .on('value', snapshot => {
//         // Alert.alert(`${JSON.stringify(snapshot)}`);
//         if (snapshot && snapshot.val().batteryLevel)
//           console.log(snapshot.val().batteryLevel);
//         // thunk.dispatch(actions.fetchBatterySuccess({ batteryList }))
//         // batteryList = snapshot.val().batteryLevel;
//         emiter({ batteryList: snapshot.val().batteryLevel || [] });
//         // put(actions.fetchBatterySuccess({ batteryList }));
//       });
//
//     // #2: Return the shutdown method;
//     return () => {
//       listener.off();
//     };
//   });
//
//   // #3: Creates a loops to keep the execution in memory;
//     const { batteryList } = yield take(channel);
//     // #4: Pause the task until the channel emits a signal and dispatch an action in the store;
//     yield put(actions.fetchBatterySuccess({ batteryList }));
// }

export function* fetchBattery$({ payload: { user } }: any): Generator<*, *, *> {
  const emailEscaped = user.email.replace(/[.]/g, ',');
  let batteryList = [];
  yield firebase
    .database()
    .ref(`/users/${emailEscaped}`)
    .once(
      'value',
      snapshot => {
        // Alert.alert(`${JSON.stringify(snapshot)}`);
        if (snapshot && snapshot.val().batteryLevel)
          console.log(snapshot.val().batteryLevel);
        // thunk.dispatch(actions.fetchBatterySuccess({ batteryList }))
        batteryList = snapshot.val().batteryLevel;
        put(actions.fetchBatterySuccess({ batteryList }));
      },
      error => console.log(error),
    );

  console.log(33, { batteryList });
  yield put(actions.fetchBatterySuccess({ batteryList }));
}

export function* addBattery$({
  payload: { level, isCharging, user },
}: any): Generator<*, *, *> {
  const emailEscaped = user.email.replace(/[.]/g, ',');
  // Alert.alert(`Majkoo ${level} ${isCharging} ${user.email}`);
  yield firebase
    .database()
    .ref(`/users/${emailEscaped}`)
    .once(
      'value',
      snapshot => {
        console.log(snapshot.val());
        let { batteryLevel } = snapshot.val();

        if (batteryLevel)
          batteryLevel.push({ level, isCharging, time: new Date() });
        else batteryLevel = [{ level, isCharging }];

        firebase
          .database()
          .ref(`/users`)
          .child(`${emailEscaped}`)
          .update({ batteryLevel });
      },
      error => {
        // console.log(error);
        Alert.alert(`Majkoo ${error.toString()}`);
      },
    );
  // console.log(payload);
  // firebase.database().ref()
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
  // yield fork(startListener);
}
