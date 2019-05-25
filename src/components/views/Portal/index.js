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
});

const actions = {
  logout,
  ecdRedirect,
  isLogged,
  addBattery,
  fetchBattery,
  pushToken,
  claimRewards,
};

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
