// @flow

import React from 'react';
// $FlowIssue
import { View } from 'react-native';

const styles = {
  containerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    position: 'relative',
  },
};

const CardSection = ({ children }: any) => (
  <View style={styles.containerStyle}>{children}</View>
);

export default CardSection;
