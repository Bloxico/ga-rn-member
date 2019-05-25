// @flow
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

type Props = {
  label: string,
  value: string,
  onChangeText: Function,
  placeholder: string,
  password: boolean,
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  password,
}: Props) => {
  const { inputStyle, labelStyle, containerStyle } = styles;

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        secureTextEntry={password}
        placeholder={placeholder}
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        style={inputStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
    flex: 2,
  },
  labelStyle: {
    fontSize: 18,
    paddingLeft: 20,
    flex: 1,
  },
  containerStyle: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Input;
