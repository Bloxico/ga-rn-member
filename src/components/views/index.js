// @flow

import { compose } from 'recompose';
import { connect } from 'react-redux';

import { fetchPartner } from '../../state/actions';
import { getPartnerId } from '../../state/selectors';
import Auth from './Auth';

const mapStateToProps = state => ({ partnerId: getPartnerId(state) });

const actions = { fetchPartner };

export default compose(
  connect(
    mapStateToProps,
    actions,
  ),
)(Auth);
