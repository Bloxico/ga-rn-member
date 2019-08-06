// @flow

import { all, takeEvery, put, call } from 'redux-saga/effects';
import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
// $FlowIssue
import * as actions from '@actions';

export function* login$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    const { user, idToken, accessToken } = yield call([
      GoogleSignin,
      GoogleSignin.signIn,
    ]);

    const credential = yield firebase.auth.GoogleAuthProvider.credential(
      idToken,
      accessToken,
    );
    // login with credential
    const deviceId = yield AsyncStorage.getItem('@DeviceId');
    const firebaseUserCredential = yield firebase
      .auth()
      .signInWithCredential(credential);

    if (user && firebaseUserCredential && deviceId) {
      yield put(
        actions.loginSuccess({
          user: { ...user, uid: firebaseUserCredential.user.uid, deviceId },
        }),
      );

      yield navigation.navigate('Dashboard');

      yield firebase
        .database()
        .ref(`/users`)
        .child(firebaseUserCredential.user.uid)
        .child('info')
        .once(
          'value',
          snapshot => {
            if (!snapshot.val()) {
              firebase
                .database()
                .ref(`/users`)
                .child(firebaseUserCredential.user.uid)
                .child('info')
                .update({
                  email: user.email,
                  name: user.name,
                  requiresToken: true,
                });
            }
          },
          () => {
            // TODO@tolja error implement
          },
        );
    }
  } catch (error) {
    yield put(actions.loginFail());
  }
}

export function* isLogged$({
  payload: { navigation },
}: any): Generator<*, *, *> {
  try {
    yield GoogleSignin.configure();

    yield firebase.app();
    const isLogged = yield GoogleSignin.isSignedIn();
    let deviceId = yield AsyncStorage.getItem('@DeviceId');

    if (!deviceId) {
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function(c) {
          const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;

          return v.toString(16);
        },
      );

      yield AsyncStorage.setItem('@DeviceId', deviceId);
    }

    if (isLogged) {
      const {
        user,
        idToken,
        accessToken,
      } = yield GoogleSignin.signInSilently();

      const credential = yield firebase.auth.GoogleAuthProvider.credential(
        idToken,
        accessToken,
      );

      // login with credential
      const {
        user: { uid },
      } = yield firebase.auth().signInWithCredential(credential);

      yield put(
        actions.isLoggedSuccess({
          user: {
            ...user,
            uid,
            deviceId,
          },
        }),
      );

      yield navigation.navigate('Dashboard');
    }

    yield put(actions.isLoggedSuccess());
  } catch (error) {
    yield put(actions.isLoggedFail());
  }
}

export function* logout$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    yield GoogleSignin.signOut();

    yield put(actions.logoutSuccess());

    yield navigation.navigate('Welcome');
  } catch (error) {
    yield put(actions.logoutFail());
  }
}

// $FlowIssue
export default function*() {
  yield all([takeEvery(actions.LOGIN, login$)]);
  yield all([takeEvery(actions.IS_LOGGED, isLogged$)]);
  yield all([takeEvery(actions.LOGOUT, logout$)]);
}
