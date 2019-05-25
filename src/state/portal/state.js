// @flow

export type StateT = {
  redirectInProgress: boolean,
  redirectFail: boolean,
  batteryInProgress: boolean,
  batteryFetchInProgress: boolean,
  pushTokenInProgress: boolean,
  batteryList: [],
  reward: number,
  percentTillRewarded: number,
  timeTillRewarded?: number,
  stepReward: number,
  claimRewardInProgress: boolean,
};

const initialState: StateT = {
  redirectInProgress: false,
  redirectFail: false,
  batteryInProgress: false,
  batteryFetchInProgress: false,
  pushTokenInProgress: false,
  batteryList: [],
  reward: 0,
  percentTillRewarded: 0,
  timeTillRewarded: undefined,
  stepReward: 0,
  claimRewardInProgress: false,
};

export default initialState;
