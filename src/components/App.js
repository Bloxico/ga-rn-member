// @flow
import React, { Component } from 'react';
import { View, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
} from 'react-navigation';

// $FlowIssue
import configureStore from '@state/configureStore';

import RegisterPage from './views/Auth/Register';
import SideDrawer from './common/SideDrawer';
import PortalPage from './views/Portal';

const { store } = configureStore();
type Props = {};

const AppStack = createStackNavigator({
  Dashboard: { screen: PortalPage },
});

const AppDrawerNavigator = createDrawerNavigator(
  {
    Dashboard: AppStack,
  },
  {
    drawerBackgroundColor: '#11152e',
    contentComponent: SideDrawer,
  },
);

const AuthSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: RegisterPage },
  Dashboard: AppDrawerNavigator,
});

const AppContainer = createAppContainer(AuthSwitchNavigator);

export default class App extends Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <View style={{ flex: 1, backgroundColor: '#0c0f21' }}>
          <StatusBar barStyle="light-content" />
          <AppContainer />
        </View>
      </Provider>
    );
  }
}
