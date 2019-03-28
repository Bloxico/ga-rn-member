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
