import { combineReducers } from 'redux';
import welcome from './welcome/reducer';
import portal from './portal/reducer';

export default combineReducers({
  welcome,
  portal,
});
