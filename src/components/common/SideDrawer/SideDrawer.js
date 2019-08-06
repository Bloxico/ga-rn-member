// @flow
import React, { Component } from 'react';
import { SafeAreaView } from 'react-navigation';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
// $FlowIssue
import { WhiteStandardText, GrayStandardText, Badge } from '@ui';
// $FlowIssue
import { PARTNER_LINK } from '@constants';

type Props = {
  user: any,
  logout: Function,
  navigation: any,
  addBattery: Function,
  ecdRedirect: Function,
};

export default class drawerContentComponents extends Component<Props> {
  logout = () => {
    const { logout, navigation, addBattery, user } = this.props;
    DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';
      addBattery({ level: batteryLevel, isCharging, user });
    });
    logout({ navigation });
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  partnerRedirect = () => {
    Linking.openURL(PARTNER_LINK);
  };

  render() {
    const { user } = this.props;
    const {
      drawerItem,
      container,
      drawerHeader,
      avatar,
      drawerHeaderText,
      drawerMenu,
      drawerHeaderTextContainer,
      drawerHeaderDescription,
      avatarContainer,
    } = styles;

    return (
      <View style={container}>
        <SafeAreaView forceInset={{ bottom: 'never' }} style={container}>
          <View style={drawerHeader}>
            <View style={avatarContainer}>
              <Image style={avatar} source={{ uri: user.photo }} />
            </View>
            <View style={drawerHeaderTextContainer}>
              <WhiteStandardText style={drawerHeaderText}>
                {user.name}
              </WhiteStandardText>
              <GrayStandardText style={drawerHeaderDescription}>
                {user.email}
              </GrayStandardText>
            </View>
          </View>
          <View style={drawerMenu}>
            <ScrollView>
              <TouchableOpacity onPress={this.partnerRedirect}>
                <View style={{ ...drawerItem }}>
                  <WhiteStandardText>GOG Platform</WhiteStandardText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.ecdRedirect}>
                <View style={{ ...drawerItem }}>
                  <WhiteStandardText>EnergyCoin Dashboard</WhiteStandardText>
                  <Badge status="success" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.logout}>
                <View style={drawerItem}>
                  <WhiteStandardText>Log out</WhiteStandardText>
                </View>
              </TouchableOpacity>
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
    paddingLeft: 24,
    borderBottomColor: '#A9BEC799',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarContainer: {
    borderTopLeftRadius: 27,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 27,
    marginLeft: 24,
    overflow: 'hidden',
  },
  container: { flex: 1 },
  avatar: { width: 60, height: 60 },
  drawerHeaderTextContainer: { paddingLeft: 24 },
  drawerHeaderText: { fontSize: 21 },
  drawerHeaderDescription: { marginTop: 5 },
  drawerMenu: {
    flex: 1,
    backgroundColor: '#0c0f20',
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#A9BEC799',
  },
});
