// @flow
import React from 'react';
// import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-elements';

type Props = {};

const GABadge = (props: Props) => {
  return (
    <Badge
      badgeStyle={{
        minWidth: 6,
        height: 6,
        borderColor: '#2B3336',
        borderRadius: 3,
        backgroundColor: '#27C556',
      }}
      {...props}
    />
  );
};
// badgeStyle={{width: 10, height: 10, borderWidth: 2, borderColor: '#2B3336', borderRadius: 14}}
// const styles = StyleSheet.create({});

export default GABadge;
