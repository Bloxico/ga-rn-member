// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

// $FlowIssue
import { logout, ecdRedirect, isLogged } from '@actions';
// $FlowIssue
import { getUser } from '@selectors';

import Portal from './Portal';

const mapStateToProps = state => ({ ...getUser(state) });

const actions = { logout, ecdRedirect, isLogged };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
