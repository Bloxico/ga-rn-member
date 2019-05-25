// @flow
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
  headerText: string,
};

const Header = ({ headerText }: Props) => {
  const { textStyle, viewStyle } = styles;

  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{headerText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    backgroundColor: '#0c0f21',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    paddingTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
    position: 'relative',
  },
  textStyle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

// Make the component available to other parts of the app
export default Header;
