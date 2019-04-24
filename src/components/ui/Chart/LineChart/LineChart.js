import React, { Component } from 'react';
import { View } from 'react-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { VictoryChart, VictoryContainer, VictoryLine } from 'victory-native';

type Props = {
  data: Array,
};

export default class LineChart extends Component<Props> {
  render() {
    const { data } = this.props;
    return (
      <View pointerEvents="none">
        <VictoryChart>
          <Defs>
            <LinearGradient id="aaa" x1="0%" y="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgb(203, 231, 47)" />
              <Stop offset="100%" stopColor="rgb(40, 207, 195)" />
            </LinearGradient>
          </Defs>
          <VictoryLine
            standalone={false}
            containerComponent={<VictoryContainer responsive />}
            padding={0}
            interpolation="natural"
            style={{
              data: {
                stroke: 'url(#aaa)',
                strokeWidth: 2,
                strokeLinecap: 'round',
                fill: '#3d5875',
              },
            }}
            data={data}
          />
        </VictoryChart>
      </View>
    );
  }
}
