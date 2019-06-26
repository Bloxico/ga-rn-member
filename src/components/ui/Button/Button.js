// @flow
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

type InputStatuses = 'solid' | 'clear' | 'outline';

type Props = {
  icon?: any,
  buttonStyle?: any,
  titleStyle?: any,
  type?: InputStatuses,
};

const GAButton = (props: Props) => {
  const {
    buttonDefaultStyle,
    greenButton,
    buttonWithIcon,
    buttonTitle,
    secondaryTitle,
    grayButton,
  } = styles;
  const { icon, buttonStyle, titleStyle, type, style } = props;

  return (
    <Button
      buttonStyle={[
        type !== 'clear' && greenButton,
        type !== 'clear' && icon && buttonWithIcon,
        type !== 'clear' && buttonDefaultStyle,
        style,
      ]}
      titleStyle={[buttonTitle, titleStyle]}
      disabledStyle={grayButton}
      disabledTitleStyle={secondaryTitle}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  buttonDefaultStyle: { width: '100%', height: 48, borderRadius: 24 },
  greenButton: { backgroundColor: '#27C556' },
  grayButton: { backgroundColor: '#11152e' },
  buttonWithIcon: { paddingLeft: 46 },
  buttonTitle: { fontSize: 16, fontWeight: 'bold' },
  secondaryTitle: { color: '#4E5B61' },
});

export default GAButton;
