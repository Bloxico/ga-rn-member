import { createAction } from 'redux-actions';

export const PARTNER = '[PARTNER] fetch';
export const PARTNER_SUCCESS = `${PARTNER} success`;
export const PARTNER_FAIL = `${PARTNER} fail`;

export const fetchPartner = createAction(PARTNER);
export const fetchPartnerSuccess = createAction(PARTNER_SUCCESS);
export const fetchPartnerFail = createAction(PARTNER_FAIL);
