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
  ]),
  { ...initialState },
);
