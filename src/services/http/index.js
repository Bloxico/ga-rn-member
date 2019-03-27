// @flow
// $FlowIssue
import { API_URL } from '@constants';

import { setAuthHeaderInterceptor } from './interceptors';
import http from './http';

http.setConfig({
  baseURL: API_URL,
});

http.interceptors('request', setAuthHeaderInterceptor);

export default http;
