// @flow

import { all, takeEvery, put } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import base64 from 'react-native-base64';
import { Linking, Alert } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';

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
  try {
    const emailEscaped = user.email.replace(/[.]/g, ',');
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

    // console.log(33, { batteryList });
    yield put(actions.fetchBatterySuccess({ batteryList }));
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* pushToken$({
  payload: { token, user },
}: any): Generator<*, *, *> {
  try {
    const { token } = token;
    const emailEscaped = user.email.replace(/[.]/g, ',') || '';
    yield firebase
      .database()
      .ref(`/users`)
      .child(`${emailEscaped}`)
      .update({ token });
  } catch (error) {
    // TODO@tolja implement error
  }
}

export function* addBattery$({
  payload: { level, isCharging, user, isBackground, notification },
}: any): Generator<*, *, *> {
  const emailEscaped = user.email.replace(/[.]/g, ',') || '';
  // Alert.alert(`Majkoo ${level} ${isCharging} ${user.email}`);
  // yield PushNotification.configure({
  //   // (optional) Called when Token is generated (iOS and Android)
  //   onRegister: function(token) {
  //     console.log('TOKEN:', token);
  //     Alert.alert(token.token);
  //     firebase
  //       .database()
  //       .ref(`/users`)
  //       .child(`${emailEscaped}`)
  //       .update({ token });
  //   },
  //
  //   // (required) Called when a remote or local notification is opened or received
  //   onNotification: function(notification) {
  //     console.log('NOTIFICATION:', notification);
  //     DeviceBattery.getBatteryLevel().then(level => {
  //       // console.log(level); // between 0 and 1
  //       DeviceBattery.isCharging().then(isCharging => {
  //         // console.log(isCharging); // true or false
  //         // Alert.alert(`${level.toString()} ${user.email} ${isCharging}`);
  //         firebase
  //           .database()
  //           .ref(`/users`)
  //           .child(`${emailEscaped}`)
  //           .update({
  //             batteryLevel2: {
  //               level,
  //               isCharging,
  //               isBackground: true,
  //               time: new Date(),
  //             },
  //           })
  //           .then(() => {
  //             Alert.alert('idemooo back');
  //             notification.finish('backgroundFetchResultNewData');
  //           });
  //
  //         // firebase.database().ref()
  //       });
  //     });
  //     // process the notification
  //
  //     // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
  //   },
  //   // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
  //   senderId: '351332438899',
  //   // IOS ONLY (optional): default: all - Permissions to register.
  //   permissions: {
  //     alert: true,
  //     badge: true,
  //     sound: true,
  //   },
  //
  //   // Should the initial notification be popped automatically
  //   // default: true
  //   popInitialNotification: true,
  //
  //   /**
  //    * (optional) default: true
  //    * - Specified if permissions (ios) and token (android and ios) will requested or not,
  //    * - if not, you must call PushNotificationsHandler.requestPermissions() later
  //    */
  //   requestPermissions: true,
  // });
  // firebase
  //   .messaging()
  //   .hasPermission()
  //   .then(enabled => {
  //     if (enabled) {
  //       firebase
  //         .messaging()
  //         .getToken()
  //         .then(token => {
  //           console.log('LOG: ', token);
  //           firebase
  //             .database()
  //             .ref(`/users`)
  //             .child(`${emailEscaped}`)
  //             .update({ token });
  //         });
  //       // user has permissions
  //     } else {
  //       firebase
  //         .messaging()
  //         .requestPermission()
  //         .then(() => {
  //           Alert.alert('User Now Has Permission');
  //         })
  //         .catch(error => {
  //           Alert.alert('Error', error);
  //           // User has rejected permissions
  //         });
  //     }
  //   });
  yield firebase
    .database()
    .ref(`/users/${emailEscaped}`)
    .once(
      'value',
      snapshot => {
        // console.log(snapshot.val());
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
          .catch(() => Alert.alert('vrv notif pao'));
      },
      error => {
        // console.log(error);
        // TODO@tolja implement error
        Alert.alert(`Majkoo ${error.toString()}`);
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
