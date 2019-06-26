import { createAction } from 'redux-actions';

export const ECD_REDIRECT = '[ECD_REDIRECT]';
export const ECD_REDIRECT_SUCCESS = `${ECD_REDIRECT} success`;
export const ECD_REDIRECT_FAIL = `${ECD_REDIRECT} fail`;

export const ecdRedirect = createAction(ECD_REDIRECT);
export const ecdRedirectSuccess = createAction(ECD_REDIRECT_SUCCESS);
export const ecdRedirectFail = createAction(ECD_REDIRECT_FAIL);

export const BATTERY = '[BATTERY]';
export const BATTERY_SUCCESS = `${BATTERY} success`;
export const BATTERY_FAIL = `${BATTERY} fail`;

export const addBattery = createAction(BATTERY);
export const addBatterySuccess = createAction(BATTERY_SUCCESS);
export const addBatteryFail = createAction(BATTERY_FAIL);

export const BATTERY_FETCH = '[BATTERY_FETCH]';
export const BATTERY_FETCH_SUCCESS = `${BATTERY_FETCH} success`;
export const BATTERY_FETCH_FAIL = `${BATTERY_FETCH} fail`;

export const fetchBattery = createAction(BATTERY_FETCH);
export const fetchBatterySuccess = createAction(BATTERY_FETCH_SUCCESS);
export const fetchBatteryFail = createAction(BATTERY_FETCH_FAIL);

export const PUSH_TOKEN = '[PUSH_TOKEN]';
export const PUSH_TOKEN_SUCCESS = `${PUSH_TOKEN} success`;
export const PUSH_TOKEN_FAIL = `${PUSH_TOKEN} fail`;

export const pushToken = createAction(PUSH_TOKEN);
export const pushTokenSuccess = createAction(PUSH_TOKEN_SUCCESS);
export const pushTokenFail = createAction(PUSH_TOKEN_FAIL);

export const CLAIM_REWARDS = '[CLAIM_REWARDS]';
export const CLAIM_REWARDS_SUCCESS = `${CLAIM_REWARDS} success`;
export const CLAIM_REWARDS_FAIL = `${CLAIM_REWARDS} fail`;

export const claimRewards = createAction(CLAIM_REWARDS);
export const claimRewardsSuccess = createAction(CLAIM_REWARDS_SUCCESS);
export const claimRewardsFail = createAction(CLAIM_REWARDS_FAIL);

export const ECD_CONNECTED = '[ECD_CONNECTED]';
export const ECD_CONNECTED_SUCCESS = `${ECD_CONNECTED} success`;
export const ECD_CONNECTED_FAIL = `${ECD_CONNECTED} fail`;

export const ecdConnected = createAction(ECD_CONNECTED);
export const ecdConnectedSuccess = createAction(ECD_CONNECTED_SUCCESS);
export const ecdConnectedFail = createAction(ECD_CONNECTED_FAIL);
