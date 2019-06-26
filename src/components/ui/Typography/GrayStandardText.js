import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';

type Props = {
  children: any,
  style: any,
};

export default class GrayStandardText extends Component<Props> {
  render() {
    const { children, style } = this.props;
    return (
      <Text {...this.props} style={{ ...styles.myAppText, ...style }}>
        {children}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  myAppText: {
    fontSize: 12,
    color: '#A9BEC7',
  },
});
