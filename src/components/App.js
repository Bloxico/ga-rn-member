// @flow

import React, { Component } from 'react';
import { Alert, PushNotificationIOS, ScrollView } from 'react-native';
import { Provider } from 'react-redux';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

// $FlowIssue
import configureStore from '@state/configureStore';

import RegisterPage from './views/Auth/Register';
import PortalPage from './views/Portal';
import PushNotification from 'react-native-push-notification';
import firebase from 'react-native-firebase';
import DeviceBattery from 'react-native-device-battery';

const { store } = configureStore();
type Props = {};

const AuthSwitchNavigator = createSwitchNavigator({
  Welcome: { screen: RegisterPage },
  Dashboard: { screen: PortalPage },
});

const AppContainer = createAppContainer(AuthSwitchNavigator);

export default class App extends Component<Props> {
  componentDidMount(): void {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
        console.log('TOKEN:', token);
        Alert.alert(token.token);
        // firebase
        //   .database()
        //   .ref(`/users`)
        //   .child(`${emailEscaped}`)
        //   .update({ token });
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
        // DeviceBattery.getBatteryLevel().then(level => {
        //   // console.log(level); // between 0 and 1
        //   DeviceBattery.isCharging().then(isCharging => {
        //     // console.log(isCharging); // true or false
        //     // Alert.alert(`${level.toString()} ${user.email} ${isCharging}`);
        //     firebase
        //       .database()
        //       .ref(`/users`)
        //       .child(`${emailEscaped}`)
        //       .update({
        //         batteryLevel2: {
        //           level,
        //           isCharging,
        //           isBackground: true,
        //           time: new Date(),
        //         },
        //       })
        //       .then(() => {
        //         Alert.alert('idemooo back');
        //         notification.finish(PushNotificationIOS.FetchResult.NewData);
        //       });
        //
        //     // firebase.database().ref()
        //   });
        // });
        Alert.alert('idemoooo back');
        // process the notification

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
      },
      onRemoteFetch: function(notification) {
        console.log(notification);
        Alert.alert('Majko mila eo ga');
      },
      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderId: '351332438899',
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true,
    });
  }

  render() {
    return (
      <Provider store={store}>
        <ScrollView style={{ flex: 1 }}>
          <AppContainer />
        </ScrollView>
      </Provider>
    );
  }
}
