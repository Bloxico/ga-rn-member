// @flow

import React from 'react';
// $FlowIssue
import { View, StyleSheet } from 'react-native';

const CardSection = ({ children, style }: any) => (
  <View style={{ ...styles.containerStyle, ...style }}>{children}</View>
);

const styles = StyleSheet.create({
  containerStyle: {
    paddingHorizontal: 5,
  },
});

export default CardSection;
