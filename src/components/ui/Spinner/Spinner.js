import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type Props = {
  size?: string,
};

const Spinner = ({ size }: Props) => (
  <View style={styles.spinnerStyle}>
    <ActivityIndicator size={size || 'large'} />
  </View>
);

const styles = StyleSheet.create({
  spinnerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Spinner;
