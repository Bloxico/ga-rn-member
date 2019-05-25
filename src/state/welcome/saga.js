// @flow

import { all, takeEvery, put, call } from 'redux-saga/effects';
import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

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
    const firebaseUserCredential = yield firebase
      .auth()
      .signInWithCredential(credential);

    if (user && firebaseUserCredential) {
      yield put(
        actions.loginSuccess({
          user: { ...user, uid: firebaseUserCredential.user.uid },
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
            if (!snapshot.val())
              firebase
                .database()
                .ref(`/users`)
                .child(firebaseUserCredential.user.uid)
                .child('info')
                .update({
                  email: user.email,
                  name: user.name,
                });
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

    if (isLogged) {
      const userInfo = yield GoogleSignin.getCurrentUser();

      if (userInfo) {
        const { user } = userInfo;

        yield put(actions.isLoggedSuccess({ user }));
      } else {
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
        const firebaseUserCredential = yield firebase
          .auth()
          .signInWithCredential(credential);

        yield put(
          actions.isLoggedSuccess({
            user: { ...user, uid: firebaseUserCredential.user.uid },
          }),
        );
      }
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
