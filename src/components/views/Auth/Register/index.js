// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

// $FlowIssue
import { login, isLogged } from '@actions';
// $FlowIssue
import { isLoggedInProgress } from '@selectors';

import Register from './Register';

const mapStateToProps = state => ({ ...isLoggedInProgress(state) });

const actions = { login, isLogged };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Register);
