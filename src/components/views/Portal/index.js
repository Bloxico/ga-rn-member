// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

import {
  logout,
  ecdRedirect,
  isLogged,
  addBattery,
  fetchBattery,
  pushToken,
  // $FlowIssue
} from '@actions';

import {
  getUser,
  getBatteryList,
  getRewardNumber,
  getPercentTillRewarded,
  getTimeTillRewarded,
  getStepReward,
  getRandomNumber,
  getToClaimReward,
  // $FlowIssue
} from '@selectors';

import Portal from './Portal';

const mapStateToProps = state => ({
  ...getUser(state),
  ...getBatteryList(state),
  ...getRewardNumber(state),
  ...getPercentTillRewarded(state),
  ...getTimeTillRewarded(state),
  ...getStepReward(state),
  ...getRandomNumber(state),
  ...getToClaimReward(state),
});

const actions = {
  logout,
  ecdRedirect,
  isLogged,
  addBattery,
  fetchBattery,
  pushToken,
};

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
