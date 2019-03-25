import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { GoogleSigninButton } from 'react-native-google-signin';

import { Header, Card, CardSection } from 'ui';

type Props = { login: Function, isLogged: Function, navigation: any };

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
    return (
      <View>
        <Header headerText={'Register'} />
        <Card>
          <CardSection>
            <Text>Sign in with your google account</Text>
          </CardSection>
          <CardSection>
            <GoogleSigninButton
              style={{ width: 192, height: 48 }}
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

export default Register;
