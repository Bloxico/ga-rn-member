// @flow
import React, { Component } from 'react';
import { Easing, View, PixelRatio } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import CountDown from 'react-native-countdown-component';
// $FlowIssue
import { REWARD_STEPS } from '@constants';
// $FlowIssue
import { GrayStandardText } from '@ui';

type Props = {
  activeChunk: number,
  activePercent: number,
  timeTillComplete: number,
  animationCompleted: Function,
  pixel: number,
};

type State = {
  newTime: number,
};

export const REWARD_STEPS_SUM: number = REWARD_STEPS.reduce(
  (sum, a) => sum + a,
  0,
);

export default class AnimatedChunks extends Component<Props, State> {
  state = {
    newTime: 0,
  };

  circularProgress: any;

  componentWillReceiveProps(nextProps: any): void {
    const { activePercent, timeTillComplete } = nextProps;
    // const { timeTillComplete: oldTime } = this.props;
    const { newTime } = this.state;
    // console.log('CHUNKK', nextProps, this.props);
    // if(timeTillComplete !== newTime)
    //   this.setState({newTime: timeTillComplete});
    if (this.circularProgress && timeTillComplete !== newTime) {
      // console.log('uso brat');
      this.circularProgress.reAnimate(
        activePercent,
        100,
        timeTillComplete * 60000,
        Easing.linear,
      );
      this.setState({ newTime: timeTillComplete });
    }
  }

  render() {
    const {
      activeChunk,
      animationCompleted,
      timeTillComplete,
      pixel,
    } = this.props;

    return (
      <View
        style={{
          width: PixelRatio.roundToNearestPixel(246 * pixel),
          height: PixelRatio.roundToNearestPixel(246 * pixel),
        }}
      >
        {timeTillComplete && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {REWARD_STEPS.map((step, index) => {
              if (activeChunk !== index)
                return (
                  <AnimatedCircularProgress
                    key={Math.random()}
                    size={PixelRatio.roundToNearestPixel(246 * pixel)}
                    width={PixelRatio.roundToNearestPixel(20 * pixel)}
                    style={{ position: 'absolute' }}
                    arcSweepAngle={(step / REWARD_STEPS_SUM) * 360 - 1}
                    fill={activeChunk >= index ? 100 : 0}
                    prefill={activeChunk >= index ? 100 : 0}
                    rotation={
                      (REWARD_STEPS.reduce((c, x, i) => {
                        if (index > i) c += x;
                        return c;
                      }, 0) /
                        REWARD_STEPS_SUM) *
                      360
                    }
                    tintColor="#27C556"
                    backgroundColor="#4e5b6173"
                  />
                );
            })}
            <AnimatedCircularProgress
              size={PixelRatio.roundToNearestPixel(246 * pixel)}
              width={PixelRatio.roundToNearestPixel(20 * pixel)}
              style={{ position: 'absolute' }}
              ref={ref => (this.circularProgress = ref)}
              arcSweepAngle={
                (REWARD_STEPS[activeChunk] / REWARD_STEPS_SUM) * 360 - 1
              }
              fill={0}
              rotation={
                (REWARD_STEPS.reduce((c, x, i) => {
                  if (activeChunk > i) c += x;
                  return c;
                }, 0) /
                  REWARD_STEPS_SUM) *
                360
              }
              tintColor="#27c45680"
              backgroundColor="#4e5b6173"
              easing={Easing.linear}
              onAnimationComplete={animationCompleted}
            />
            <View style={{ alignItems: 'center' }}>
              <CountDown
                until={timeTillComplete * 60 + 1}
                size={PixelRatio.roundToNearestPixel(20 * pixel)}
                digitStyle={{ backgroundColor: 'transparent', padding: 0 }}
                digitTxtStyle={{
                  color: '#FFFFFF',
                  padding: 0,
                  fontSize: PixelRatio.roundToNearestPixel(38 * pixel),
                  fontWeight: 'normal',
                }}
                timeLabelStyle={{ color: 'red', fontWeight: 'normal' }}
                separatorStyle={{
                  color: '#FFFFFF',
                  fontSize: PixelRatio.roundToNearestPixel(38 * pixel),
                  fontWeight: 'normal',
                  marginBottom: PixelRatio.roundToNearestPixel(5 * pixel),
                }}
                timeToShow={['H', 'M', 'S']}
                timeLabels={{ h: '', m: '', s: '' }}
                showSeparator
              />
              <GrayStandardText>UNTIL NEXT REWARD</GrayStandardText>
            </View>
          </View>
        )}
      </View>
    );
  }
}
