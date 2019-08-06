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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import BackgroundFetch from 'react-native-background-fetch';
import SVGUri from 'react-native-svg-uri';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import firebase from 'react-native-firebase';
import type { RemoteMessage } from 'react-native-firebase';
import Toast from 'react-native-easy-toast';
import AsyncStorage from '@react-native-community/async-storage';

// $FlowIssue
import { REWARD_SUPPLY, PARTNER_LINK, REWARD_SUM } from '@constants';
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
import logoSVG from '@images/LogoGray.svg';

type Props = {
  user: any,
  addBattery: Function,
  fetchBattery: Function,
  percentTillRewarded: number,
  pushToken: Function,
  timeTillRewarded: number,
  stepReward: number,
  claimRewards: Function,
  batteryFetchInProgress: boolean,
  ecdRedirect: Function,
};

type State = {
  claimReward: any,
  totalClaim: number,
  isCharging: boolean,
  appState: any,
  isNetConnected: boolean,
  sumRewards: number,
  collectInProgress: boolean,
  events: [],
};
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const rem = (deviceWidth / 375 + deviceHeight / 813) / 2;

class Portal extends Component<Props, State> {
  static navigationOptions = ({ navigation }: any) => {
    return {
      title: 'GOG Platform',
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
    claimReward: {},
    totalClaim: 0,
    isCharging: false,
    appState: AppState.currentState,
    isNetConnected: true,
    sumRewards: -1,
    collectInProgress: false,
    events: [],
  };

  componentWillMount() {
    const { user } = this.props;

    this.rewardFetching();
    this.appEventRefresh(true, user);
    this.notificationHandler();
  }

  componentDidMount(): void {
    const { addBattery, user } = this.props;

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

    this.messageListener = firebase
      .messaging()
      .onMessage((notification: RemoteMessage) => {
        DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
          const isCharging =
            batteryState === 'charging' || batteryState === 'full';

          addBattery({
            batteryLevel,
            isCharging,
            user,
            notification,
          });
          Alert.alert(notification);
        });
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

  componentWillReceiveProps(): void {
    this.getLastClaimTime();

    NetInfo.fetch().then(({ isConnected }) => {
      this.setState({ isNetConnected: isConnected });
    });
  }

  componentWillUnmount() {
    const { user } = this.props;

    this.appEventRefresh(false, user);
    this.messageListener();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  notificationHandler = async () => {
    try {
      const { pushToken, user } = this.props;
      const enabled = await firebase.messaging().hasPermission();

      if (enabled) {
        // console.log(enabled);
      } else {
        await firebase.messaging().requestPermission();
      }

      const token = await firebase.messaging().getToken();
      // console.log(token);
      if (token) pushToken({ token, user });
      else {
        // console.log('no Token');
      }
    } catch (error) {
      // console.log(error);
    }
  };

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

      await firebase
        .database()
        .ref(`/users/${user.uid}/devices/${user.deviceId}`)
        .child('current_reward')
        .on('value', snapshot => {
          const { claimReward } = this.state;

          if (snapshot.val()) {
            if (
              snapshot.val().reward === 0 &&
              claimReward &&
              claimReward.reward !== 0
            )
              this.setState({
                collectInProgress: false,
                totalClaim: 0,
              });
            this.setState({ claimReward: snapshot.val() });
            // this.getLastClaimTime();
            if (snapshot.val().error) {
              this.setState({ collectInProgress: false });

              this.refs.toast.show(
                'Could not collect this time, please try again later.',
                500,
                () => {
                  firebase
                    .database()
                    .ref(`/users/${user.uid}/devices/${user.deviceId}`)
                    .child('current_reward')
                    .update({ error: false })
                    .catch(() => {
                      // console.log(error);
                      // TODO@tolja handle error
                    });
                },
              );
            }
          }
        });

      await firebase
        .database()
        .ref(`/users/${user.uid}/devices/${user.deviceId}`)
        .child('events')
        .on('value', snapshot => {
          if (snapshot.val()) {
            this.setState({ events: snapshot.val() });
          }
        });
    } catch (error) {
      // TODO@tolja implement error
    }
  };
  getLastClaimTime = async () => {
    try {
      const getReward = await AsyncStorage.getItem('@CollectingReward');
      const storageReward = JSON.parse(getReward);

      const { user, stepReward } = this.props;
      const { events, claimReward } = this.state;
      const reward = claimReward.reward || 0;
      if (
        storageReward &&
        storageReward.id === user.deviceId &&
        events.length &&
        storageReward.currentLevel > 0 &&
        storageReward.rewardTime >= new Date(events[0].timestamp).getTime()
      ) {
        this.setState({
          totalClaim:
            reward +
            REWARD_SUM[stepReward] -
            REWARD_SUM[storageReward.currentLevel],
        });
      } else this.setState({ totalClaim: reward + REWARD_SUM[stepReward] });
    } catch (error) {
      // TODO@tolja implement error
      // console.log(error);
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
    const { isCharging, events } = this.state;
    const isChargingState =
      batteryState === 'charging' || batteryState === 'full';

    fetchBattery({
      level: batteryLevel,
      isCharging: isChargingState || isCharging,
      user,
      events,
    });

    this.setState({ isCharging: isChargingState });
  };

  rewardCompleted = ({ finished }: any) => {
    const { user } = this.props;

    if (finished) {
      this.appEventRefresh(true, user);
    }
  };

  appEventRefresh = (
    fetch: boolean,
    user: any,
    updateClaim: boolean = true,
  ) => {
    const { addBattery, fetchBattery } = this.props;
    const { isCharging: isChargingCurrent, events } = this.state;

    DeviceInfo.getPowerState().then(({ batteryState, batteryLevel }) => {
      const isCharging = batteryState === 'charging' || batteryState === 'full';

      if (fetch)
        fetchBattery({
          level: batteryLevel,
          isCharging,
          user,
          updateClaim,
          events: events,
        });
      else addBattery({ level: batteryLevel, isCharging, user });
      if (isCharging !== isChargingCurrent) this.setState({ isCharging });
    });
  };

  rewardClaim = () => {
    const { claimRewards, user, stepReward } = this.props;
    const { totalClaim } = this.state;

    claimRewards({
      currentLevel: stepReward,
      user,
      reward: totalClaim,
    });

    this.setState({ collectInProgress: true });
  };

  partnerRedirect = () => {
    Linking.openURL(PARTNER_LINK);
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  messageListener: any;

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
      totalClaim,
      isCharging,
      collectInProgress,
      isNetConnected,
      sumRewards,
    } = this.state;
    let buttonTitle = '';
    if (collectInProgress) buttonTitle = 'Collecting...';
    else if (totalClaim === 0) {
      if (isCharging) buttonTitle = 'Tip: Charge battery to 100%';
      else if (stepReward === REWARD_SUPPLY.length)
        buttonTitle = 'Rewarding starts after charging';
      else buttonTitle = `Next reward is ${10 + REWARD_SUPPLY[stepReward]} GOG`;
    } else {
      if (!isNetConnected) buttonTitle = 'No Internet Connection';
      else buttonTitle = `Collect ${totalClaim} GOG`;
    }

    // if (!timeTillRewarded)
    if (timeTillRewarded !== undefined)
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
                  {buttonTitle !== '' && timeTillRewarded !== undefined && (
                    <View
                      style={{
                        marginTop: PixelRatio.roundToNearestPixel(50 * rem),
                      }}
                    >
                      <Button
                        primary={totalClaim !== 0}
                        title={buttonTitle}
                        titleStyle={{
                          fontSize: PixelRatio.roundToNearestPixel(16 * rem),
                          fontWeight: 'bold',
                        }}
                        buttonStyle={{
                          width: PixelRatio.roundToNearestPixel(327 * rem),
                          height: PixelRatio.roundToNearestPixel(48 * rem),
                          borderRadius: PixelRatio.roundToNearestPixel(
                            24 * rem,
                          ),
                          backgroundColor: '#27C556',
                        }}
                        disabled={
                          totalClaim === 0 ||
                          !isNetConnected ||
                          collectInProgress
                        }
                        onPress={this.rewardClaim}
                      />
                    </View>
                  )}
                </CardSection>
              </Card>

              <Toast
                ref="toast"
                style={{ backgroundColor: '#2b3273' }}
                positionValue={PixelRatio.roundToNearestPixel(400 * rem)}
              />
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
                  icon={
                    <SVGUri
                      style={{
                        transform: [
                          { rotate: '-90deg' },
                          { scaleX: -1 },
                          { scaleY: 1 },
                        ],
                      }}
                      source={logoSVG}
                    />
                  }
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

    return (
      <View style={{ flex: 1, backgroundColor: '#101314' }}>
        <Spinner />
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
