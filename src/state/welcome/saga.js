// @flow

import { all, takeEvery, put, call } from 'redux-saga/effects';
import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

// $FlowIssue
import * as actions from '@actions';

export function* login$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    const { user } = yield call([GoogleSignin, GoogleSignin.signIn]);

    if (user) {
      yield put(actions.loginSuccess({ user }));

      yield navigation.navigate('Dashboard');

      const emailEscaped = user.email.replace(/[.]/g, ',');

      yield firebase
        .database()
        .ref(`/users/${emailEscaped}`)
        .once(
          'value',
          snapshot => {
            console.log(snapshot.val());
            if (!snapshot.val())
              firebase
                .database()
                .ref('/users')
                .set({
                  [`${emailEscaped}`]: {
                    email: user.email,
                    name: user.name,
                  },
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
        const { user } = yield GoogleSignin.signInSilently();

        yield put(actions.isLoggedSuccess({ user }));
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
