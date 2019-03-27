import WelcomeState from './welcome/state';
import PortalState from './portal/state';

export type StateT = {
  welcome: WelcomeState,
  portal: PortalState,
};
