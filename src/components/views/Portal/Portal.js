// @flow
import React, { Component } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  NativeEventEmitter,
  NativeModules,
  AppState,
  Linking,
  PixelRatio,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
import SVGUri from 'react-native-svg-uri';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import firebase from 'react-native-firebase';

// $FlowIssue
import { REWARD_SUPPLY, PARTNER_LINK } from '@constants';
import {
  CardSection,
  Card,
  WhiteStandardText,
  GrayStandardText,
  Button,
  Badge,
  AnimatedChunks,
  Spinner,
  // $FlowIssue
} from '@ui';
// $FlowIssue
import iconMenuSVG from '@images/icon-menu.svg';
// $FlowIssue
import energySVG from '@images/energycoin.svg';
// $FlowIssue
import logoSVG from '@images/verdeus.svg';

type Props = {
  user: any,
  addBattery: Function,
  fetchBattery: Function,
  reward: number,
  percentTillRewarded: number,
  pushToken: Function,
  timeTillRewarded: number,
  stepReward: number,
  claimRewards: Function,
  toClaimReward: number,
  batteryFetchInProgress: boolean,
  ecdRedirect: Function,
};

type State = {
  claimReward: number,
  isCharging: boolean,
  appState: any,
  isNetConnected: boolean,
  isCollectable: boolean,
  sumRewards: number,
  collectInProgress: boolean,
};
const pixelRatio = PixelRatio.get();
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const rem = (deviceWidth / 375 + deviceHeight / 813) / 2;
// const rem2 = deviceHeight / 813;

class Portal extends Component<Props, State> {
  static navigationOptions = ({ navigation }: any) => {
    return {
      title: 'Dashboard',
      headerStyle: {
        backgroundColor: '#0c0f20',
        borderBottomWidth: 0,
      },
      headerBackground: (
        <LinearGradient
          colors={['#2b3273', '#0f132a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.1, 0.99]}
          style={{
            flex: 1,
            opacity: 0.5,
            width: '100%',
          }}
        />
      ),
      headerTintColor: '#FFF',
      headerLeft: (
        <TouchableOpacity
          style={{ padding: 15 }}
          onPress={() => navigation.openDrawer()}
        >
          <SVGUri style={{ width: 20, height: 14 }} source={iconMenuSVG} />
          <Badge
            status="success"
            onPress={() => navigation.openDrawer()}
            containerStyle={{ position: 'absolute', top: 13, right: 13 }}
          />
        </TouchableOpacity>
      ),
    };
  };

  state = {
    claimReward: 0,
    isCharging: false,
    appState: AppState.currentState,
    isCollectable: true,
    isNetConnected: true,
    sumRewards: -1,
    collectInProgress: false,
  };

  animation: any;

  componentWillMount() {
    const { user } = this.props;

    this.rewardFetching();
    this.appEventRefresh(true, user);
  }

  componentDidMount(): void {
    const { addBattery, user, pushToken } = this.props;
    console.log(
      'PIXEL_RATIO, WIDTH, HEIGHT,',
      pixelRatio,
      deviceWidth,
      deviceHeight,
    );

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

          addBattery({
            level: batteryLevel,
            isCharging,
            user,
            isBackground: true,
          });
        });
      },
      () => {
        // TODO@tolja implement error
      },
    );

    PushNotification.configure({
      onRegister: function(token) {
        pushToken({ token, user }); // TODO@tolja check if it is existing, put it in asyncStorage
      },
      onNotification: function(notification) {
        DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
          const isCharging =
            batteryState === 'charging' || batteryState === 'full';

          addBattery({
            batteryLevel,
            isCharging,
            user,
            notification,
          });
        });
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    const deviceInfoEmitter = new NativeEventEmitter(
      NativeModules.RNDeviceInfo,
    );

    deviceInfoEmitter.addListener(
      'powerStateDidChange',
      this.onBatteryStateChanged,
    );

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillReceiveProps(nextProps: any): void {
    const { toClaimReward, stepReward } = nextProps;
    const { isCollectable } = this.state;

    if (toClaimReward > 0 && isCollectable)
      this.setState({ claimReward: toClaimReward });
    else if (toClaimReward > 0 && stepReward)
      this.setState({ claimReward: REWARD_SUPPLY[stepReward + 1] + 1 });

    NetInfo.fetch().then(({ isConnected }) => {
      this.setState({ isNetConnected: isConnected });
    });
  }

  componentWillUnmount() {
    const { user } = this.props;

    this.appEventRefresh(false, user);

    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  rewardFetching = async () => {
    const { user } = this.props;
    try {
      await firebase
        .database()
        .ref(`/users/${user.uid}/devices/${user.deviceId}`)
        .child('sum_rewards')
        .on('value', snapshot => {
          const { collectInProgress } = this.state;

          if (collectInProgress) {
            this.setState({ collectInProgress: false });
          }

          this.setState({ sumRewards: snapshot.val() || 0 });
        });
    } catch (error) {
      // TODO@tolja implement error
    }
  };

  handleAppStateChange = (nextAppState: string) => {
    const { user, batteryFetchInProgress } = this.props;
    const { appState } = this.state;

    if (
      // $FlowIssue
      appState.match(/inactive|background/) &&
      nextAppState === 'active' &&
      !batteryFetchInProgress
    ) {
      this.appEventRefresh(true, user); // TODO@tolja consider removing?
    }

    this.setState({ appState: nextAppState });
  };

  onBatteryStateChanged = ({ batteryState, batteryLevel }: any) => {
    const { user, fetchBattery } = this.props;
    const { isCharging } = this.state;
    const isChargingState =
      batteryState === 'charging' || batteryState === 'full';

    fetchBattery({
      level: batteryLevel,
      isCharging: isChargingState || isCharging,
      user,
    });

    this.setState({ isCharging: isChargingState });
  };

  rewardCompleted = ({ finished }: any) => {
    const { user } = this.props;

    if (finished) {
      this.setState({ isCollectable: true });

      this.appEventRefresh(true, user);
    }
  };

  appEventRefresh = (
    fetch: boolean,
    user: any,
    updateClaim: boolean = true,
  ) => {
    const { addBattery, fetchBattery } = this.props;

    DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';

      if (fetch)
        fetchBattery({ level: batteryLevel, isCharging, user, updateClaim });
      else addBattery({ level: batteryLevel, isCharging, user });
      if (isCharging !== this.state.isCharging) this.setState({ isCharging });
    });
  };

  rewardClaim = () => {
    const { claimRewards, user, stepReward, reward } = this.props;
    const { claimReward } = this.state;

    claimRewards({
      currentLevel: stepReward,
      user,
      reward: claimReward,
      sumReward: reward || 0,
    });

    this.setState({
      claimReward: 0,
      isCollectable: false,
      collectInProgress: true,
    });
  };

  partnerRedirect = () => {
    Linking.openURL(PARTNER_LINK);
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  render() {
    const { stepReward, timeTillRewarded, percentTillRewarded } = this.props;
    const {
      container,
      bigFont,
      percentProgress,
      separateText,
      pageStyle,
      gradientFixedHeader,
    } = styles;
    const {
      claimReward,
      isCharging,
      collectInProgress,
      isNetConnected,
      sumRewards,
    } = this.state;
    let buttonTitle = '';

    if (claimReward === 0) {
      if (isCharging) buttonTitle = 'Tip: Charge battery to 100%';
      else if (stepReward === REWARD_SUPPLY.length)
        buttonTitle = 'Rewarding starts after charging';
      else buttonTitle = `Next reward is ${1 + REWARD_SUPPLY[stepReward]} GOG`;
    } else {
      if (!isNetConnected) buttonTitle = 'No Internet Connection';
      else buttonTitle = `Collect ${claimReward} GOG`;
    }

    if (!timeTillRewarded)
      return (
        <View style={{ flex: 1, backgroundColor: '#101314' }}>
          <Spinner />
        </View>
      );

    return (
      <View style={pageStyle}>
        <LinearGradient
          colors={['#2b3273', '#0f132a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.0, 0.99]}
          style={gradientFixedHeader}
        />
        <SafeAreaView style={container}>
          <Card style={{ height: PixelRatio.roundToNearestPixel(95 * rem) }}>
            <CardSection style={{ alignItems: 'center' }}>
              <GrayStandardText>TOTAL ACCUMULATED</GrayStandardText>
            </CardSection>

            <CardSection style={separateText}>
              {sumRewards !== -1 && (
                <WhiteStandardText style={bigFont}>
                  {sumRewards}{' '}
                  <GrayStandardText
                    style={{
                      fontSize: PixelRatio.roundToNearestPixel(16 * rem),
                      fontWeight: 'bold',
                    }}
                  >
                    GOG
                  </GrayStandardText>
                </WhiteStandardText>
              )}
            </CardSection>
          </Card>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Card style={{ flex: 1 }}>
              <CardSection style={percentProgress}>
                {isCharging || stepReward === 15 ? (
                  <View
                    style={{
                      width: PixelRatio.roundToNearestPixel(246 * rem),
                      height: PixelRatio.roundToNearestPixel(246 * rem),
                    }}
                  >
                    {isCharging ? (
                      <View
                        style={{
                          alignItems: 'center',
                          flex: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <AnimatedCircularProgress
                          fill={100}
                          prefill={100}
                          size={PixelRatio.roundToNearestPixel(246 * rem)}
                          width={PixelRatio.roundToNearestPixel(20 * rem)}
                          tintColor="#FFFFFF00"
                          backgroundColor="#4e5b6173"
                        >
                          {() => (
                            <WhiteStandardText
                              style={{
                                fontSize: PixelRatio.roundToNearestPixel(
                                  30 * rem,
                                ),
                              }}
                            >
                              Charging...
                            </WhiteStandardText>
                          )}
                        </AnimatedCircularProgress>
                      </View>
                    ) : (
                      <View
                        style={{
                          alignItems: 'center',
                          flex: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <AnimatedCircularProgress
                          fill={100}
                          prefill={100}
                          size={PixelRatio.roundToNearestPixel(246 * rem)}
                          width={PixelRatio.roundToNearestPixel(20 * rem)}
                          tintColor="#FFFFFF00"
                          backgroundColor="#27C556"
                        >
                          {() => (
                            <WhiteStandardText
                              style={{
                                fontSize: PixelRatio.roundToNearestPixel(
                                  30 * rem,
                                ),
                              }}
                            >
                              Completed
                            </WhiteStandardText>
                          )}
                        </AnimatedCircularProgress>
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      width: PixelRatio.roundToNearestPixel(246 * rem),
                      height: PixelRatio.roundToNearestPixel(246 * rem),
                    }}
                  >
                    <AnimatedChunks
                      activeChunk={stepReward}
                      activePercent={percentTillRewarded}
                      timeTillComplete={timeTillRewarded}
                      pixel={rem}
                      animationCompleted={this.rewardCompleted}
                    />
                  </View>
                )}
                {buttonTitle !== '' && (
                  <View
                    style={{
                      marginTop: PixelRatio.roundToNearestPixel(50 * rem),
                    }}
                  >
                    <Button
                      primary={claimReward !== 0}
                      title={buttonTitle}
                      titleStyle={{
                        fontSize: PixelRatio.roundToNearestPixel(16 * rem),
                        fontWeight: 'bold',
                      }}
                      buttonStyle={{
                        width: PixelRatio.roundToNearestPixel(327 * rem),
                        height: PixelRatio.roundToNearestPixel(48 * rem),
                        borderRadius: PixelRatio.roundToNearestPixel(24 * rem),
                        backgroundColor: '#27C556',
                      }}
                      disabled={
                        claimReward === 0 ||
                        !isNetConnected ||
                        collectInProgress
                      }
                      onPress={this.rewardClaim}
                    />
                  </View>
                )}
              </CardSection>
            </Card>
          </ScrollView>
        </SafeAreaView>
        <SafeAreaView
          style={{
            height: 60,
            backgroundColor: 'transparent',
          }}
        >
          <LinearGradient
            colors={['#2b3273', '#0f132a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0.0, 0.99]}
            style={gradientFixedHeader}
          />
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Button
                onPress={this.partnerRedirect}
                style={{
                  flex: 1,
                  flexBasis: 60,
                  height: 60,
                }}
                type="clear"
                icon={<SVGUri source={logoSVG} />}
              />
              <View
                style={{
                  position: 'absolute',
                  flex: 0,
                  width: 0,
                  height: 40,
                  right: 0,
                  top: 10,
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: '#A9BEC799',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                onPress={this.ecdRedirect}
                style={{
                  flex: 1,
                  flexBasis: 60,
                  height: 60,
                }}
                type="clear"
                icon={<SVGUri source={energySVG} />}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  percentProgress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientFixedHeader: {
    flex: 1,
    opacity: 0.5,
    position: 'absolute',
    width: '100%',
    height: PixelRatio.roundToNearestPixel(120 * rem),
    borderBottomEndRadius: PixelRatio.roundToNearestPixel(20 * rem),
    borderBottomStartRadius: PixelRatio.roundToNearestPixel(20 * rem),
  },
  pageStyle: { flex: 1, backgroundColor: '#0c0f20' },
  container: {
    flex: 1,
    backgroundColor: 'rgba(52, 52, 52, 0)',
    padding: PixelRatio.roundToNearestPixel(23 * rem),
  },
  bigFont: { fontSize: PixelRatio.roundToNearestPixel(30 * rem) },
  separateText: {
    paddingBottom: PixelRatio.roundToNearestPixel(10 * rem),
    paddingTop: PixelRatio.roundToNearestPixel(3 * rem),
    alignItems: 'center',
  },
});
export default Portal;
