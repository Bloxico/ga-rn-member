// @flow

export type StateT = {
  inProgress: boolean,
  fail: boolean,
};

const initialState: StateT = {
  inProgress: false,
  fail: false,
};

export default initialState;
