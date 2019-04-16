// @flow
import React, { Component } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import DeviceBattery from 'react-native-device-battery';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
import SVGUri from 'react-native-svg-uri';
import Modal from 'react-native-modal';
import DeviceInfo from 'react-native-device-info';

// $FlowIssue
import { CardSection, Card, WhiteStandardText, GrayStandardText } from '@ui';
// $FlowIssue
import iconMenuSVG from '@images/icon-menu.svg';
// $FlowIssue
import iconHelpSVG from '@images/icon-help.svg';

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

type State = {
  showHelp: boolean,
};

class Portal extends Component<Props, State> {
  static navigationOptions = ({ navigation }: any) => {
    return {
      title: 'Dashboard',
      headerStyle: {
        backgroundColor: '#0c0f21',
        borderBottomColor: '#ffffff2a',
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

  state = {
    showHelp: false,
  };

  componentWillMount() {
    const { fetchBattery, user } = this.props;

    DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';
      fetchBattery({ level: batteryLevel, isCharging, user });
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
        DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
          const isCharging =
            batteryState === 'charging' || batteryState === 'full';
          addBattery({ level: batteryLevel, isCharging, user });
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

    // DeviceBattery.addListener(this.onBatteryStateChanged);
    const deviceInfoEmitter = new NativeEventEmitter(
      NativeModules.RNDeviceInfo,
    );
    deviceInfoEmitter.addListener(
      'powerStateDidChange',
      this.onBatteryStateChanged,
    );
    deviceInfoEmitter.addListener(
      'batteryLevelDidChange',
      this.onBatteryLevelChanged,
    );
  }

  componentWillReceiveProps(nextProps: any): void {
    const { percentTillRewarded, timeTillRewarded } = nextProps;
    console.log('ALOOO move me', timeTillRewarded, percentTillRewarded)
      console.log('TOOOO');
      this.circularProgress.reAnimate(
        percentTillRewarded,
        100,
        timeTillRewarded * 60000,
      );
  }

  componentWillUnmount() {
    const { addBattery, user } = this.props;
    DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';
      addBattery({ level: batteryLevel, isCharging, user });
    });
  }

  onBatteryStateChanged = ({ batteryState, batteryLevel }: any) => {
    const { user, fetchBattery } = this.props;
    const isCharging = batteryState === 'charging' || batteryState === 'full';
    fetchBattery({ level: batteryLevel, isCharging, user });
  };

  onBatteryLevelChanged = (level: number) => {
    const { user, fetchBattery } = this.props;
    DeviceInfo.getPowerState().then(({ batteryState }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';
      fetchBattery({ level, isCharging, user });
    });
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
    const { fetchBattery, user } = this.props;

    if (finished) {
      DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
        const isCharging =
          batteryState === 'charging' || batteryState === 'full';
        fetchBattery({ level: batteryLevel, isCharging, user });
      });
    }
  };

  toggleHelp = () => {
    const { showHelp } = this.state;
    this.setState({ showHelp: !showHelp });
  };

  circularProgress: any;

  render() {
    const { reward, percentTillRewarded, stepReward } = this.props;
    const { showHelp } = this.state;
    const {
      container,
      bigFont,
      percentText,
      percentProgress,
      modalContent,
      modalHeader,
      modalHeaderIcon,
      modalHeaderText,
      separateText,
      separator,
      iconHelp,
    } = styles;

    return (
      <SafeAreaView style={container}>
        <Modal
          isVisible={showHelp}
          onSwipeComplete={this.toggleHelp}
          swipeDirection="up"
          animationIn="slideInDown"
          animationOut="slideOutUp"
          onBackdropPress={this.toggleHelp}
        >
          <View style={modalContent}>
            <View style={modalHeader}>
              <SVGUri style={modalHeaderIcon} source={iconHelpSVG} />

              <WhiteStandardText style={modalHeaderText}>
                Rewarding
              </WhiteStandardText>
            </View>

            <View style={separateText}>
              <WhiteStandardText>
                First reward is after 9 hours of not charging your phone.
              </WhiteStandardText>
            </View>

            <View>
              <WhiteStandardText>
                Every next reward requires less time and it is possible to
                accumulate maximum 15 GOG in 72 hours.
              </WhiteStandardText>
            </View>
          </View>
        </Modal>

        <ScrollView>
          <Card>
            <CardSection>
              <GrayStandardText>Total accumulated</GrayStandardText>
            </CardSection>

            <CardSection style={separateText}>
              <WhiteStandardText style={bigFont}>
                GOG {reward + stepReward}
              </WhiteStandardText>
            </CardSection>

            <CardSection style={separator}>
              <GrayStandardText>
                Reward accumulating: {stepReward}/15
              </GrayStandardText>

              <TouchableOpacity onPress={this.toggleHelp}>
                <SVGUri style={iconHelp} source={iconHelpSVG} />
              </TouchableOpacity>
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  percentProgress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  modalContent: {
    backgroundColor: '#151B3B',
    alignSelf: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomColor: '#ffffff2a',
    borderBottomWidth: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ffffff1a',
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: { flex: 1, backgroundColor: '#0c0f21', padding: 15 },
  iconHelp: { width: 20, height: 20, marginLeft: 8, marginBottom: 7 },
  modalHeaderIcon: { width: 20, height: 20, marginRight: 20 },
  modalHeaderText: { fontSize: 22 },
  bigFont: { fontSize: 30 },
  percentText: { alignItems: 'center', paddingTop: 30 },
  separateText: { paddingBottom: 10, paddingTop: 3 },
});

export default Portal;
