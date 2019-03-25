// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

import { logout } from '../../../state/actions';

import Portal from './Portal';

const mapStateToProps = state => ({ ...state });

const actions = { logout };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Portal);
