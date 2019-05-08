// @flow

import { all, takeEvery, put, call } from 'redux-saga/effects';
import { GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

// $FlowIssue
import * as actions from '@actions';

export function* login$({ payload: { navigation } }: any): Generator<*, *, *> {
  try {
    const data = yield call([GoogleSignin, GoogleSignin.signIn]);
    console.log(data);
    const credential = yield firebase.auth.GoogleAuthProvider.credential(
      data.idToken,
      data.accessToken,
    );
    // login with credential
    const firebaseUserCredential = yield firebase
      .auth()
      .signInWithCredential(credential);
    console.log(firebaseUserCredential);
    const { user } = data;
    if (user && firebaseUserCredential) {
      yield put(
        actions.loginSuccess({
          user: { ...user, uid: firebaseUserCredential.user.uid },
        }),
      );

      yield navigation.navigate('Dashboard');

      const emailEscaped = user.email.replace(/[.]/g, ',');

      yield firebase
        .database()
        .ref(`/users`)
        .child(firebaseUserCredential.user.uid)
        .child('info')
        .once(
          'value',
          snapshot => {
            console.log(81729, snapshot.val());
            // console.log(snapshot.val());
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
// function getFirebaseUser(firebaseUser) {
//   console.log('ALOOOOOOOO', firebaseUser);
//   return new Promise(resolve => {
//     const credential = firebase.auth.GoogleAuthProvider.credential(
//       firebaseUser.idToken,
//       firebaseUser.accessToken,
//     );
//     resolve(credential);
//   })
//     .then(credential => {
//       const firebaseUserCredential = firebase
//         .auth()
//         .signInWithCredential(credential);
//     })
//     .then(firebaseUser => firebaseUser);
//   // login with credential
// }
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
        console.log(45552, user);
        yield put(actions.isLoggedSuccess({ user }));
      } else {
        const a = yield GoogleSignin.signInSilently();
        const credential = yield firebase.auth.GoogleAuthProvider.credential(
          a.idToken,
          a.accessToken,
        );
        // login with credential
        const firebaseUserCredential = yield firebase
          .auth()
          .signInWithCredential(credential);
        const { user } = a;
        // console.log(55555, b);
        console.log(firebaseUserCredential);
        yield put(
          actions.isLoggedSuccess({
            user: { ...user, uid: firebaseUserCredential.user.uid },
          }),
        );

        // console.log(333, firebaseUser);
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
