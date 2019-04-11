// @flow
import React, { Component } from 'react';
import { SafeAreaView } from 'react-navigation';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import DeviceBattery from 'react-native-device-battery';
import SVGUri from 'react-native-svg-uri';

// $FlowIssue
import { WhiteStandardText } from '@ui';
// $FlowIssue
import iconDashboard from '@images/icon-dashboard.svg';
// $FlowIssue
import iconSignOut from '@images/icon-signout.svg';

type Props = {
  user: any,
  logout: Function,
  navigation: any,
  addBattery: Function,
};

export default class drawerContentComponents extends Component<Props> {
  logout = () => {
    const { logout, navigation, addBattery, user } = this.props;
    DeviceBattery.getBatteryLevel().then(level => {
      DeviceBattery.isCharging().then(isCharging => {
        addBattery({ level, isCharging, user });
      });
    });
    logout({ navigation });
  };

  renderMenu = () => {
    let menuArray = [
      {
        id: 1,
        screen: 'Dashboard',
        title: 'Dashboard',
        image: iconDashboard,
      },
    ];
    const { navigation } = this.props;
    const { drawerItem, drawerItemImage } = styles;

    return menuArray.map<any>(item => {
      return (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate(item.screen)}
          key={item.id}
        >
          <View style={drawerItem}>
            <SVGUri style={drawerItemImage} source={item.image} />
            <WhiteStandardText>{item.title}</WhiteStandardText>
          </View>
        </TouchableWithoutFeedback>
      );
    });
  };

  render() {
    const { user } = this.props;
    const {
      drawerItem,
      drawerItemImage,
      container,
      drawerHeader,
      avatar,
      drawerHeaderText,
      drawerMenu,
    } = styles;

    return (
      <View style={container}>
        <SafeAreaView forceInset={{ bottom: 'never' }} style={container}>
          <View style={drawerHeader}>
            <Image style={avatar} source={{ uri: user.photo }} />
            <View style={drawerHeaderText}>
              <WhiteStandardText>{user.name}</WhiteStandardText>
            </View>
          </View>
          <View style={drawerMenu}>
            <ScrollView>
              {this.renderMenu()}
              <TouchableWithoutFeedback onPress={this.logout}>
                <View style={drawerItem}>
                  <SVGUri style={drawerItemImage} source={iconSignOut} />
                  <WhiteStandardText>Sign out</WhiteStandardText>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  drawerItem: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: { flex: 1 },
  drawerItemImage: { width: 35, height: 35 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginLeft: 20 },
  drawerHeaderText: { paddingLeft: 20 },
  drawerMenu: { flex: 1, backgroundColor: '#151b3b', paddingTop: 20 },
});
