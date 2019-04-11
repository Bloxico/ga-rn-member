// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ children, style }: any) => {
  return <View style={{ ...styles.containerStyle, ...style }}>{children}</View>;
};

const styles = StyleSheet.create({
  containerStyle: {
    shadowColor: '#000',
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
  },
});

export default Card;
