// @flow
import React, { Component } from 'react';
// $FlowIssue
import { View } from 'react-native';

import { Button } from '../common';

type Props = { fetchPartner: Function, partnerId: any };

class Auth extends Component<Props> {
  componentDidUpdate() {
    const { partnerId } = this.props;
    console.log(partnerId);
  }

  render() {
    const { fetchPartner } = this.props;
    return (
      <View>
        <Button onPress={() => fetchPartner('aaaad')}>Allooo</Button>
      </View>
    );
  }
}

export default Auth;
