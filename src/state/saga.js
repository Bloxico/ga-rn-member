// @flow

import { all } from 'redux-saga/effects';

import welcomeSaga from './welcome/saga';

// $FlowIssue
export default function*() {
  yield all([welcomeSaga()]);
}
