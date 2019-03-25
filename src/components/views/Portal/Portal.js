import React, { Component } from 'react';
import { View, Linking } from 'react-native';

import { Button, CardSection, Card, Header } from '../../ui';

type Props = { logout: Function, navigation: any };
class Portal extends Component<Props> {
  logout = () => {
    const { logout, navigation } = this.props;
    logout({ navigation });
  };

  render() {
    return (
      <View>
        <Header headerText={'Dashboard'} />
        <Card>
          <CardSection>
            <Button onPress={this.logout}>Sign out</Button>
          </CardSection>
          <CardSection>
            <Button
              onPress={() =>
                Linking.openURL('https://dashboard.energycoin.eu/auth')
              }
            >
              Go to ECD
            </Button>
          </CardSection>
        </Card>
      </View>
    );
  }
}

export default Portal;
