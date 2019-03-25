// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

import { login, isLogged } from '../../../../state/actions';
import Register from './Register';

const mapStateToProps = state => ({ ...state });

const actions = { login, isLogged };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Register);
