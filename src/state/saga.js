// @flow

import { all } from 'redux-saga/effects';

import welcomeSaga from './welcome/saga';
import portalSaga from './portal/saga';

// $FlowIssue
export default function*() {
  yield all([welcomeSaga(), portalSaga()]);
}
