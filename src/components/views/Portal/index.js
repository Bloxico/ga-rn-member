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
  claimRewards,
  ecdConnected,
  // $FlowIssue
} from '@actions';

import {
  getUser,
  getBatteryList,
  getRewardNumber,
  getPercentTillRewarded,
  getTimeTillRewarded,
  getStepReward,
  isClaimButton,
  getRewardToClaim,
  isBatteryFetching,
  isUserIntegrated,
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
  ...isClaimButton(state),
  ...getRewardToClaim(state),
  ...isBatteryFetching(state),
  ...isUserIntegrated(state),
});

const actions = {
  logout,
  ecdRedirect,
  isLogged,
  addBattery,
  fetchBattery,
  pushToken,
  claimRewards,
  ecdConnected,
};

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
