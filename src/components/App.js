// @flow

import React, { Component } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import configureStore from '../state/configureStore';
import RegisterPage from './views/Auth/Register';
import PortalPage from './views/Portal';

const { store } = configureStore();
type Props = {};

const AuthSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: RegisterPage },
  Dashboard: { screen: PortalPage },
});

const AppContainer = createAppContainer(AuthSwitchNavigator);

export default class App extends Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <View>
          <AppContainer />
        </View>
      </Provider>
    );
  }
}
