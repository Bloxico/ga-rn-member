import React, { Component } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode';

import { Button, CardSection, Card, Header } from '@ui';

type Props = {
  logout: Function,
  navigation: any,
  ecdRedirect: Function,
  user: any,
};
class Portal extends Component<Props> {
  logout = () => {
    const { logout, navigation } = this.props;
    logout({ navigation });
  };

  ecdRedirect = () => {
    const { user, ecdRedirect } = this.props;
    ecdRedirect({ user });
  };

  render() {
    const { user } = this.props;

    return (
      <View>
        <Header headerText={'Dashboard'} />
        <Card>
          <CardSection>
            <Text>Welcome </Text>
            <Text>{user.name}</Text>
          </CardSection>
          <CardSection>
            <QRCode
              value={user.email}
              size={200}
              bgColor="green"
              fgColor="#FFF"
            />
          </CardSection>
          <CardSection>
            <Button onPress={this.logout}>Sign out</Button>
          </CardSection>
          <CardSection>
            <Button onPress={this.ecdRedirect}>Go to ECD</Button>
          </CardSection>
        </Card>
      </View>
    );
  }
}

export default Portal;
