// @flow
import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import SVGUri from 'react-native-svg-uri';
// $FlowIssue
import { Card, CardSection, Spinner, WhiteStandardText, Button } from '@ui';
// $FlowIssue
import google from '@images/Google.svg';

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
      logoTextStyle,
      descTextStyle,
      googleColumn,
      googleIcon,
      scrollViewContent,
    } = styles;

    if (isLoggedInProgress)
      return (
        <View style={{ flex: 1 }}>
          <Spinner />
        </View>
      );

    return (
      <SafeAreaView style={container}>
        <Card style={registerTable}>
          <ScrollView contentContainerStyle={scrollViewContent}>
            <CardSection style={logoColumn}>
              <View style={logoSize}>{/*<SVGUri source={logo} />*/}</View>

              <WhiteStandardText style={logoTextStyle}>
                Welcome to GreenCharge!
              </WhiteStandardText>

              <WhiteStandardText style={descTextStyle}>
                We reward you for using your phones battery life efficiently.
              </WhiteStandardText>
            </CardSection>

            <CardSection style={googleColumn}>
              <Button
                icon={<SVGUri style={googleIcon} source={google} />}
                primary
                title="Continue with Google"
                onPress={this.login}
              />
            </CardSection>
          </ScrollView>
        </Card>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  logoTextStyle: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 300,
  },
  descTextStyle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#879EA8',
    marginTop: 10,
    maxWidth: 300,
  },
  logoColumn: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 15,
  },
  logoSize: {
    width: 64,
    height: 64,
    // transform: [{ rotate: '-90deg' }],
    marginBottom: 15,
  },
  googleIcon: {
    position: 'absolute',
    left: 10,
    backgroundColor: '#ffffff',
    paddingLeft: 7,
    paddingTop: 7,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  googleColumn: { flex: 1, justifyContent: 'flex-start', maxWidth: 320 },
  container: { flex: 1, backgroundColor: '#0c0f21' },
  registerTable: { flex: 2 },
});

export default Register;
