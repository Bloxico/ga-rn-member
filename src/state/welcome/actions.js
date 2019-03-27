import { createAction } from 'redux-actions';

export const LOGIN = '[LOGIN]';
export const LOGIN_SUCCESS = `${LOGIN} success`;
export const LOGIN_FAIL = `${LOGIN} fail`;

export const login = createAction(LOGIN);
export const loginSuccess = createAction(LOGIN_SUCCESS);
export const loginFail = createAction(LOGIN_FAIL);

export const IS_LOGGED = '[IS_LOGGED]';
export const IS_LOGGED_SUCCESS = `${IS_LOGGED} success`;
export const IS_LOGGED_FAIL = `${IS_LOGGED} fail`;

export const isLogged = createAction(IS_LOGGED);
export const isLoggedSuccess = createAction(IS_LOGGED_SUCCESS);
export const isLoggedFail = createAction(IS_LOGGED_FAIL);

export const LOGOUT = '[LOGOUT]';
export const LOGOUT_SUCCESS = `${LOGOUT} success`;
export const LOGOUT_FAIL = `${LOGOUT} fail`;

export const logout = createAction(LOGOUT);
export const logoutSuccess = createAction(LOGOUT_SUCCESS);
export const logoutFail = createAction(LOGOUT_FAIL);
