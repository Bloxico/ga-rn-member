// @flow

import { all, takeEvery, put } from 'redux-saga/effects';

import * as actions from './actions';

// $FlowIssue
export function* fetchPartner$({ payload }): Generator<*, *, *> {
  yield put(actions.fetchPartnerSuccess({ partnerId: payload }));
}

// $FlowIssue
export default function*() {
  yield all([takeEvery(actions.PARTNER, fetchPartner$)]);
}
