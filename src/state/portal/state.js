// @flow

export type StateT = {
  redirectInProgress: boolean,
  redirectFail: boolean,
  batteryInProgress: boolean,
  batteryFetchInProgress: boolean,
  batteryList: [],
};

const initialState: StateT = {
  redirectInProgress: false,
  redirectFail: false,
  batteryInProgress: false,
  batteryFetchInProgress: false,
  batteryList: [],
};

export default initialState;
