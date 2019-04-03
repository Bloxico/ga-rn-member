import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  AppState,
  Alert,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import DeviceBattery from 'react-native-device-battery';
import BackgroundFetch from 'react-native-background-fetch';
import firebase, { Notification } from 'react-native-firebase';
import VoipPushNotification from 'react-native-voip-push-notification';
// import { BatteryManager } from '';

import { Button, CardSection, Card, Header } from '@ui';
import PushNotification from 'react-native-push-notification';
// import firebase from 'react-native-firebase';
// import * as actions from '../../../state/portal/actions';

// const { BatteryManager } = NativeModules.BatteryManager;
// const batteryManagerEmitter = new NativeEventEmitter(BatteryManager);

type Props = {
  logout: Function,
  navigation: any,
  ecdRedirect: Function,
  user: any,
  addBattery: Function,
  fetchBattery: Function,
  batteryList: [],
};
type State = {
  batteryList: [],
  appState: any,
};
class Portal extends Component<Props, State> {
  state = {
    batteryList: [],
    appState: AppState.currentState,
  };

  componentDidMount(): void {
    const { addBattery, user, fetchBattery, pushToken } = this.props;
    // Configure it.
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false, // <-- Android-only,
        startOnBoot: true, // <-- Android-only
      },
      () => {
        console.log('[js] Received background-fetch event');
        DeviceBattery.getBatteryLevel().then(level => {
          // console.log(level); // between 0 and 1
          DeviceBattery.isCharging().then(isCharging => {
            // console.log(isCharging); // true or false
            // Alert.alert(`${level.toString()} ${user.email} ${isCharging}`);
            addBattery({ level, isCharging, user, isBackground: true });
            BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
            // firebase.database().ref()
          });
        });
      },
      error => {
        console.log('[js] RNBackgroundFetch failed to start');
      },
    );

    PushNotification.configure({
      onRegister: function(token) {
        pushToken({ token });
      },
      onNotification: function(notification) {
        DeviceBattery.getBatteryLevel().then(level => {
          DeviceBattery.isCharging().then(isCharging => {
            addBattery({
              level,
              isCharging,
              user,
              isBackground: 'notifikacija',
              notification,
            });
          });
        });
      },
      senderId: '351332438899',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    DeviceBattery.getBatteryLevel().then(level => {
      DeviceBattery.isCharging().then(isCharging => {
        addBattery({ level, isCharging, user, isBackground: false });
      });
    });

    fetchBattery({ user });

    this.s = DeviceBattery.addListener(this.onBatteryStateChanged);

    // VoipPushNotification.requestPermissions(); // required

    // VoipPushNotification.addEventListener('register', (token) => {
    //   // send token to your apn provider server
    //   Alert.alert(JSON.stringify(token));
    // });

    // VoipPushNotification.addEventListener('notification', notification => {
    //   // register your VoIP client, show local notification, etc.
    //   // e.g.
    //   this.doRegister();
    //
    //   /* there is a boolean constant exported by this module called
    //    *
    //    * wakeupByPush
    //    *
    //    * you can use this constant to distinguish the app is launched
    //    * by VoIP push notification or not
    //    *
    //    * e.g.
    //    */
    //   if (VoipPushNotification.wakeupByPush) {
    //     // do something...
    //     Alert.alert(JSON.stringify(notification));
    //     // remember to set this static variable to false
    //     // since the constant are exported only at initialization time
    //     // and it will keep the same in the whole app
    //     VoipPushNotification.wakeupByPush = false;
    //   }
    //   Alert.alert('majkle sunce ti');
    //
    //   /**
    //    * Local Notification Payload
    //    *
    //    * - `alertBody` : The message displayed in the notification alert.
    //    * - `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view";
    //    * - `soundName` : The sound played when the notification is fired (optional).
    //    * - `category`  : The category of this notification, required for actionable notifications (optional).
    //    * - `userInfo`  : An optional object containing additional notification data.
    //    */
    //   VoipPushNotification.presentLocalNotification({
    //     alertBody: "hello! " + notification.getMessage()
    //   });
    // });
  }

  // componentDidUpdate(): void {
  //   console.log(this.props);
  // }

  // componentWillUnmount(): void {
  // AppState.removeEventListener('change', this.handleAppStateChange);
  // this.notificationDisplayedListener();
  // this.notificationListener();
  // this.s.remove();
  // }

  // handleAppStateChange = nextAppState => {
  //   if (
  //     this.state.appState.match(/inactive|background/) &&
  //     nextAppState === 'active'
  //   ) {
  //     console.log('App has come to the foreground!');
  //   }
  //   this.setState({ appState: nextAppState });
  //   DeviceBattery.addListener(this.onBatteryStateChanged);
  //   Alert.alert(nextAppState);
  // };

  // batteryList = async () => {
  //   const { user } = this.props;
  //   const emailEscaped = user.email.replace(/[.]/g, ',');
  //   await firebase
  //     .database()
  //     .ref(`/users/${emailEscaped}`)
  //     .on('value', snapshot => {
  //       // Alert.alert(`${JSON.stringify(snapshot)}`);
  //       if (snapshot && snapshot.val().batteryLevel)
  //         console.log(snapshot.val().batteryLevel);
  //       // thunk.dispatch(actions.fetchBatterySuccess({ batteryList }))
  //       batteryList = snapshot.val().batteryLevel;
  //       // put(actions.fetchBatterySuccess({ batteryList }));
  //     });
  // };

  onBatteryStateChanged = state => {
    const { addBattery, user } = this.props;
    addBattery({ level: state.level, isCharging: state.charging, user });
  };

  logout = () => {
    const { logout, navigation } = this.props;
    logout({ navigation });
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  render() {
    const { user, batteryList } = this.props;

    return (
      <View>
        <Header headerText="Dashboard" />
        <Card>
          <CardSection>
            <Text>Welcome </Text>
            <Text>{user.name}</Text>
          </CardSection>
          <CardSection>
            <QRCode
              value={user.email}
              size={200}
              bgColor="green"
              fgColor="#FFF"
            />
          </CardSection>
          <CardSection>
            <Button onPress={this.logout}>Sign out</Button>
          </CardSection>
          <CardSection>
            <Button onPress={this.ecdRedirect}>Go to ECD</Button>
          </CardSection>
          {batteryList.map(item => (
            <CardSection key={item.time}>
              <Text>
                Percent: {item.level},{' '}
                {(item.isCharging && 'Charging') || 'Not Charging'}, Time:{' '}
                {item.time && new Date(item.time).toLocaleDateString()}{' '}
                {item.time && new Date(item.time).toLocaleTimeString()}{' '}
                {(item.isBackground && 'In Background') || ''}
              </Text>
            </CardSection>
          ))}
        </Card>
      </View>
    );
  }
}

export default Portal;
