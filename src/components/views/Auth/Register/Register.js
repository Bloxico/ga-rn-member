// @flow
import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { GoogleSigninButton } from 'react-native-google-signin';
// $FlowIssue
import { Card, CardSection, Spinner, WhiteStandardText } from '@ui';
// $FlowIssue
import logo from '@images/energycoin.png';

type Props = {
  login: Function,
  isLogged: Function,
  navigation: any,
  isLoggedInProgress: boolean,
};

class Register extends Component<Props> {
  componentWillMount(): void {
    const { isLogged, navigation } = this.props;
    isLogged({ navigation });
  }

  login = () => {
    const { login, navigation } = this.props;
    login({ navigation });
  };

  render() {
    const { isLoggedInProgress } = this.props;
    const {
      container,
      registerTable,
      logoColumn,
      logoSize,
      logoTextColumn,
      logoTextStyle,
      googleColumn,
      googleButton,
    } = styles;

    if (isLoggedInProgress)
      return (
        <View style={{ flex: 1 }}>
          <Spinner />
        </View>
      );

    return (
      <View style={container}>
        <Card style={registerTable}>
          <CardSection style={logoColumn}>
            <Image style={logoSize} source={logo} />
          </CardSection>
          <CardSection style={logoTextColumn}>
            <WhiteStandardText style={logoTextStyle}>
              Green Charge
            </WhiteStandardText>
          </CardSection>
          <CardSection style={googleColumn}>
            <GoogleSigninButton
              style={googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={this.login}
            />
          </CardSection>
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0f21' },
  registerTable: { flex: 2, alignItems: 'center' },
  logoColumn: { flex: 1, justifyContent: 'flex-end', paddingBottom: 10 },
  logoSize: { width: 100, height: 100 },
  logoTextColumn: { flex: 1, justifyContent: 'flex-start' },
  logoTextStyle: { fontSize: 30, fontWeight: 'bold' },
  googleColumn: { flex: 1, justifyContent: 'flex-start' },
  googleButton: { width: 192, height: 48 },
});

export default Register;
