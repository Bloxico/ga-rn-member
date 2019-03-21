// @flow

import { handleActions } from 'redux-actions';

import * as actions from './actions';
import initialState from './state';

// $FlowIssue
export default handleActions(
  new Map([
    [
      actions.PARTNER,
      state => ({
        ...state,
        inProgress: true,
      }),
    ],
    [
      actions.PARTNER_FAIL,
      (state, { payload }) => ({
        ...state,
        inProgress: false,
        fail: true,
        ...(payload && payload.message ? { error: payload.message } : {}),
      }),
    ],
    [
      actions.PARTNER_SUCCESS,
      (state, { payload }) => ({
        ...state,
        ...payload,
        inProgress: false,
        fail: true,
      }),
    ],
  ]),
  { ...initialState },
);
