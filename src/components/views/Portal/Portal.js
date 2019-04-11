// @flow
import React, { Component } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import DeviceBattery from 'react-native-device-battery';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import SVGUri from 'react-native-svg-uri';

// $FlowIssue
import { CardSection, Card, WhiteStandardText, GrayStandardText } from '@ui';
// $FlowIssue
import iconMenuSVG from '@images/icon-menu.svg';

type Props = {
  logout: Function,
  navigation: any,
  ecdRedirect: Function,
  user: any,
  addBattery: Function,
  fetchBattery: Function,
  reward: number,
  percentTillRewarded: number,
  pushToken: Function,
  timeTillRewarded: number,
  stepReward: number,
};

class Portal extends Component<Props> {
  static navigationOptions = ({ navigation }: any) => {
    return {
      title: 'Dashboard',
      headerStyle: {
        backgroundColor: '#0c0f21',
      },
      headerTintColor: '#FFF',
      headerLeft: (
        <TouchableOpacity
          style={{ paddingLeft: 15 }}
          onPress={() => navigation.openDrawer()}
        >
          <SVGUri style={{ width: 30, height: 15 }} source={iconMenuSVG} />
        </TouchableOpacity>
      ),
    };
  };

  componentWillMount() {
    const { fetchBattery, user, addBattery } = this.props;
    DeviceBattery.getBatteryLevel().then(level => {
      DeviceBattery.isCharging().then(isCharging => {
        addBattery({ level, isCharging, user });
        fetchBattery({ user });
      });
    });
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

    this.s = DeviceBattery.addListener(this.onBatteryStateChanged);
  }

  componentWillReceiveProps(nextProps: any, nextContext: any): void {
    console.log('SLEDECI PROPS', nextProps, nextContext);
    const { percentTillRewarded, timeTillRewarded } = this.props;

    if (timeTillRewarded) {
      this.circularProgress.reAnimate(
        percentTillRewarded,
        100,
        timeTillRewarded * 60000,
      );
    }
  }

  onBatteryStateChanged = state => {
    const { addBattery, user, fetchBattery } = this.props;
    addBattery({ level: state.level, isCharging: state.charging, user });
    fetchBattery({ user });
  };

  logout = () => {
    const { logout, navigation } = this.props;
    logout({ navigation });
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  rewardCompleted = ({ finished }: any) => {
    const { fetchBattery, user, addBattery } = this.props;

    if (finished) {
      DeviceBattery.getBatteryLevel().then(level => {
        DeviceBattery.isCharging().then(isCharging => {
          addBattery({ level, isCharging, user });
          fetchBattery({ user });
        });
      });
    }
  };

  circularProgress: any;

  render() {
    const { reward, percentTillRewarded, stepReward } = this.props;
    const { container, bigFont, percentText, percentProgress } = styles;
    return (
      <View style={container}>
        <ScrollView>
          <Card>
            <CardSection>
              <GrayStandardText>Total accumulated</GrayStandardText>
            </CardSection>
            <CardSection>
              <WhiteStandardText style={bigFont}>
                GOG {reward + stepReward}
              </WhiteStandardText>
            </CardSection>
            <CardSection>
              <GrayStandardText>
                Maximum reward is 15 GOG for 72h
              </GrayStandardText>
            </CardSection>
            <CardSection>
              <WhiteStandardText>
                Reward accumulating: {stepReward}/15
              </WhiteStandardText>
            </CardSection>
            <CardSection style={percentText}>
              <WhiteStandardText>Percent until Rewarded</WhiteStandardText>
            </CardSection>
            <CardSection style={percentProgress}>
              <AnimatedCircularProgress
                size={200}
                width={15}
                ref={ref => (this.circularProgress = ref)}
                fill={percentTillRewarded}
                prefill={percentTillRewarded}
                tintColor="#76da7a"
                lineCap="round"
                backgroundColor="#3d5875"
                onAnimationComplete={this.rewardCompleted}
              >
                {fill => (
                  <WhiteStandardText>{fill.toFixed(2)}%</WhiteStandardText>
                )}
              </AnimatedCircularProgress>
            </CardSection>
          </Card>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0f21' },
  bigFont: { fontSize: 30 },
  percentText: { alignItems: 'center', paddingTop: 30 },
  percentProgress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
});

export default Portal;
