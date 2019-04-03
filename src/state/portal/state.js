// @flow

export type StateT = {
  redirectInProgress: boolean,
  redirectFail: boolean,
  batteryInProgress: boolean,
  batteryFetchInProgress: boolean,
  pushTokenInProgress: boolean,
  batteryList: [],
};

const initialState: StateT = {
  redirectInProgress: false,
  redirectFail: false,
  batteryInProgress: false,
  batteryFetchInProgress: false,
  pushTokenInProgress: false,
  batteryList: [],
};

export default initialState;
