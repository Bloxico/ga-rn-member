import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import DeviceBattery from 'react-native-device-battery';
// import firebase from 'react-native-firebase';
// import { BatteryManager } from '';

import { Button, CardSection, Card, Header } from '@ui';
import firebase from 'react-native-firebase';
import * as actions from '../../../state/portal/actions';

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
};
class Portal extends Component<Props, State> {
  state = {
    batteryList: [],
  };

  componentDidMount(): void {
    const { addBattery, user, fetchBattery } = this.props;
    DeviceBattery.getBatteryLevel().then(level => {
      // console.log(level); // between 0 and 1
      DeviceBattery.isCharging().then(isCharging => {
        // console.log(isCharging); // true or false
        // Alert.alert(`${level.toString()} ${user.email} ${isCharging}`);
        addBattery({ level, isCharging, user });
        // firebase.database().ref()
      });
    });
    fetchBattery({ user });
    // const subscription = calendarManagerEmitter.addListener(
    //   'BatteryStatus',
    //   (reminder) =>
    // );
    // BatteryManager.updateBatteryLevel(function(info){
    //   this._subscription = DeviceEventEmitter.addListener('BatteryStatus', this.onBatteryStatus);
    //   this.setState({batteryLevel: info.level});
    //   this.setState({charging: info.isPlugged});
    // }.bind(this));
    // to attach a listener
    this.s = DeviceBattery.addListener(this.onBatteryStateChanged);
  }

  componentDidUpdate(): void {
    console.log(this.props);
  }

  componentWillUnmount(): void {
    // this.s.remove();
  }

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
    // console.log(state); // {level: 0.95, charging: true}
    // Alert.alert(`11${JSON.stringify({ level: state.level, isCharging: state.charging, user })}`);
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
        <Header headerText={'Dashboard'} />
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
            <CardSection>
              <Text>
                Percent: {item.level},{' '}
                {item.isCharging ? 'Charging' : 'Not Charging'}, Time:{' '}
                {item.time && new Date(item.time).toLocaleDateString()}{' '}
                {item.time && new Date(item.time).toLocaleTimeString()}
              </Text>
            </CardSection>
          ))}
        </Card>
      </View>
    );
  }
}

export default Portal;
