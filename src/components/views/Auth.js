// @flow
import React, { Component } from 'react';
import { View } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';

type Props = { fetchPartner: Function, partnerId: any };
type State = { userInfo: any };

class Auth extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      userInfo: {}
    }

  }
  componentWillUnmount(): void {
    // GoogleSignin.configure();
  }

  componentDidUpdate() {
    const { partnerId } = this.props;
    const { userInfo } = this.state;
    console.log(partnerId, userInfo);
  }

  signIn = async () => {
    try {
      await GoogleSignin.configure();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      this.setState({ userInfo });
    } catch (error) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  render() {
    const { fetchPartner } = this.props;
    return (
      <View>
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this.signIn}
          />
      </View>
    );
  }
}

export default Auth;
