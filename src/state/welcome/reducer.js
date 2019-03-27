// @flow

import { handleActions } from 'redux-actions';

import * as actions from './actions';
import initialState from './state';

// $FlowIssue
export default handleActions(
  new Map([
    [
      actions.LOGIN,
      state => ({
        ...state,
        loginInProgress: true,
      }),
    ],
    [
      actions.LOGIN_FAIL,
      state => ({
        ...state,
        loginInProgress: false,
        loginFail: true,
      }),
    ],
    [
      actions.LOGIN_SUCCESS,
      (state, { payload }) => ({
        ...state,
        ...payload,
        loginInProgress: false,
        loginFail: false,
      }),
    ],
    [
      actions.IS_LOGGED,
      (state, { payload }) => ({
        ...state,
        isLogged: payload,
        isLoggedInProgress: true,
      }),
    ],
    [
      actions.IS_LOGGED_FAIL,
      state => ({
        ...state,
        isLoggedInProgress: false,
        isLoggedFail: true,
      }),
    ],
    [
      actions.IS_LOGGED_SUCCESS,
      (state, { payload }) => ({
        ...state,
        ...payload,
        isLoggedInProgress: false,
        isLoggedFail: false,
      }),
    ],
    [
      actions.LOGOUT,
      state => ({
        ...state,
        logoutInProgress: true,
      }),
    ],
    [
      actions.LOGOUT_FAIL,
      state => ({
        ...state,
        logoutInProgress: false,
        logoutFail: true,
      }),
    ],
    [
      actions.LOGOUT_SUCCESS,
      state => ({
        ...state,
        logoutInProgress: false,
        isLoggedInProgress: false,
        logoutFail: false,
      }),
    ],
  ]),
  { ...initialState },
);
