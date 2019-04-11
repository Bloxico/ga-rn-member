package com.gamember;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.horcrux.svg.SvgPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.rctbattery.BatteryManagerPackage;
import com.robinpowered.react.battery.DeviceBatteryPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.google.firebase.database.FirebaseDatabase;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new SvgPackage(),
            new ReactNativePushNotificationPackage(),
            new RNBackgroundFetchPackage(),
            new BatteryManagerPackage(),
            new DeviceBatteryPackage(),
            new RNGestureHandlerPackage(),
            new RNFirebasePackage(),
            new RNGoogleSigninPackage(),
            new RNFirebaseDatabasePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    FirebaseDatabase.getInstance().setPersistenceEnabled(true);
  }
}
