// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

import {
  logout,
  ecdRedirect,
  isLogged,
  addBattery,
  fetchBattery,
  // $FlowIssue
} from '@actions';
// $FlowIssue
import { getUser, getBatteryList } from '@selectors';

import Portal from './Portal';

const mapStateToProps = state => ({
  ...getUser(state),
  ...getBatteryList(state),
});

const actions = { logout, ecdRedirect, isLogged, addBattery, fetchBattery };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
