// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';
// $FlowIssue
import { getUser } from '@selectors';
// $FlowIssue
import { logout, addBattery } from '@actions';

import SideDrawer from './SideDrawer';

const mapStateToProps = state => ({
  ...getUser(state),
});

const actions = { logout, addBattery };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(SideDrawer);
