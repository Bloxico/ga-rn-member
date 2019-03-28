// @flow

import { handleActions } from 'redux-actions';

import * as actions from './actions';
import initialState from './state';

// $FlowIssue
export default handleActions(
  new Map([
    [
      actions.ECD_REDIRECT,
      state => ({
        ...state,
        redirectInProgress: true,
      }),
    ],
    [
      actions.ECD_REDIRECT_SUCCESS,
      state => ({
        ...state,
        redirectInProgress: false,
        redirectFail: true,
      }),
    ],
    [
      actions.ECD_REDIRECT_FAIL,
      state => ({
        ...state,
        redirectInProgress: false,
        redirectFail: false,
      }),
    ],
    [
      actions.BATTERY,
      state => ({
        ...state,
        batteryInProgress: true,
      }),
    ],
    [
      actions.BATTERY_SUCCESS,
      state => ({
        ...state,
        batteryInProgress: false,
      }),
    ],
    [
      actions.BATTERY_FAIL,
      state => ({
        ...state,
        batteryInProgress: false,
      }),
    ],
    [
      actions.BATTERY_FETCH,
      state => ({
        ...state,
        batteryFetchInProgress: true,
      }),
    ],
    [
      actions.BATTERY_FETCH_SUCCESS,
      (state, { payload }) => ({
        ...state,
        ...payload,
        batteryFetchInProgress: false,
      }),
    ],
    [
      actions.BATTERY_FETCH_FAIL,
      state => ({
        ...state,
        batteryFetchInProgress: false,
      }),
    ],
  ]),
  { ...initialState },
);
