// @flow

export type StateT = {
  loginInProgress: boolean,
  loginFail: boolean,
  isLoggedInProgress: boolean,
  isLoggedFail: boolean,
  logoutInProgress: boolean,
  logoutFail: boolean,
};

const initialState: StateT = {
  loginInProgress: false,
  loginFail: false,
  isLoggedInProgress: false,
  isLoggedFail: false,
  logoutInProgress: false,
  logoutFail: false,
};

export default initialState;
