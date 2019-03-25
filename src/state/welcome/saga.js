// @flow

import { all, takeEvery, put } from 'redux-saga/effects';
import { GoogleSignin } from 'react-native-google-signin';

import * as actions from './actions';

export function* login$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    yield GoogleSignin.signIn();

    yield navigation.navigate('Dashboard');

    yield put(actions.loginSuccess());
  } catch (error) {
    yield put(actions.loginFail());
  }
}

export function* isLogged$({
  payload: { navigation },
}: any): Generator<*, *, *> {
  try {
    yield GoogleSignin.configure();

    const isLogged = yield GoogleSignin.isSignedIn();

    if (isLogged) yield navigation.navigate('Dashboard');

    yield put(actions.isLoggedSuccess({ isLogged }));
  } catch (error) {
    yield put(actions.isLoggedFail());
  }
}

export function* logout$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    yield GoogleSignin.signOut();

    yield navigation.navigate('Welcome');

    yield put(actions.logoutSuccess());
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
