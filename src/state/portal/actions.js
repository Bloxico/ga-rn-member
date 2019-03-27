import { createAction } from 'redux-actions';

export const ECD_REDIRECT = '[ECD_REDIRECT]';
export const ECD_REDIRECT_SUCCESS = `${ECD_REDIRECT} success`;
export const ECD_REDIRECT_FAIL = `${ECD_REDIRECT} fail`;

export const ecdRedirect = createAction(ECD_REDIRECT);
export const ecdRedirectSuccess = createAction(ECD_REDIRECT_SUCCESS);
export const ecdRedirectFail = createAction(ECD_REDIRECT_FAIL);
