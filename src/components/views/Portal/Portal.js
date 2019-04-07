import React, { Component } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode';
import DeviceBattery from 'react-native-device-battery';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
// import VoipPushNotification from 'react-native-voip-push-notification';

import { Button, CardSection, Card, Header } from '@ui';

type Props = {
  logout: Function,
  navigation: any,
  ecdRedirect: Function,
  user: any,
  addBattery: Function,
  fetchBattery: Function,
  batteryList: [],
  pushToken: Function,
};

class Portal extends Component<Props> {
  componentWillMount() {
    const { fetchBattery, user } = this.props;
    fetchBattery({ user });
  }
  componentDidMount(): void {
    const { addBattery, user, pushToken } = this.props;

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false, // <-- Android-only,
        startOnBoot: true, // <-- Android-only
      },
      () => {
        DeviceBattery.getBatteryLevel().then(level => {
          DeviceBattery.isCharging().then(isCharging => {
            addBattery({ level, isCharging, user, isBackground: true });
          });
        });
      },
      () => {
        // TODO@tolja implement error
      },
    );

    PushNotification.configure({
      onRegister: function(token) {
        pushToken({ token, user });
      },
      onNotification: function(notification) {
        DeviceBattery.getBatteryLevel().then(level => {
          DeviceBattery.isCharging().then(isCharging => {
            addBattery({
              level,
              isCharging,
              user,
              isBackground: false,
              notification,
            });
          });
        });
      },
      permissions: {
        alert: false,
        badge: false,
        sound: false,
      },
      popInitialNotification: false,
      requestPermissions: true,
    });

    DeviceBattery.getBatteryLevel().then(level => {
      DeviceBattery.isCharging().then(isCharging => {
        addBattery({ level, isCharging, user, isBackground: false });
      });
    });

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
          {batteryList &&
            batteryList.map(item => (
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
