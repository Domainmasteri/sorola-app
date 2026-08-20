import React, { useEffect, useRef } from 'react';
import { Alert, NativeModules, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Updates from 'expo-updates';

import HomeScreen from './screens/HomeScreen';
import JsonFormatterScreen from './screens/JsonFormatterScreen';
import PasswordScreen from './screens/PasswordScreen';
import QRScreen from './screens/QRScreen';
import ShortenerScreen from './screens/ShortenerScreen';
import PastebinScreen from './screens/PastebinScreen';
import ShareScreen from './screens/ShareScreen';
import ToolHelpScreen from './screens/ToolHelpScreen';
import Base64Screen from './screens/Base64Screen';
import UuidScreen from './screens/UuidScreen';
import JwtScreen from './screens/JwtScreen';
import ExportViewScreen from './screens/ExportViewScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import { TranslationProvider, useTranslation } from './i18n';

const Stack = createNativeStackNavigator();
const { PlausibleTracker } = NativeModules;

function trackPlausiblePageView(screenName) {
  if (Platform.OS !== 'android' || !screenName || !PlausibleTracker?.trackEvent) {
    return;
  }

  try {
    PlausibleTracker.trackEvent('pageview', screenName);
  } catch {
    // Tracking failures must never affect navigation.
  }
}

function AppNavigator() {
  const { t } = useTranslation();
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if (!Updates.isEnabled) {
          return;
        }

        const update = await Updates.checkForUpdateAsync();

        if (!update.isAvailable) {
          return;
        }

        await Updates.fetchUpdateAsync();

        Alert.alert(
          t('update.availableTitle'),
          t('update.availableMessage'),
          [
            { text: t('update.later'), style: 'cancel' },
            {
              text: t('update.installNow'),
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch {
                  Alert.alert(t('update.installFailedTitle'), t('update.installFailedMessage'));
                }
              },
            },
          ]
        );
      } catch {
        // Ignore OTA check errors silently in development or unsupported environments.
      }
    };

    checkForUpdates();
  }, [t]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const routeName = navigationRef.getCurrentRoute()?.name;
        routeNameRef.current = routeName;

        if (routeName) {
          trackPlausiblePageView(routeName);
        }
      }}
      onStateChange={() => {
        const routeName = navigationRef.getCurrentRoute()?.name;

        if (!routeName || routeNameRef.current === routeName) {
          return;
        }

        routeNameRef.current = routeName;
        trackPlausiblePageView(routeName);
      }}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#191f2d' },
          headerTintColor: '#ffaa00',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0b0d13' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('nav.home') }} />
        <Stack.Screen name="Password" component={PasswordScreen} options={{ title: t('nav.password') }} />
        <Stack.Screen name="QR" component={QRScreen} options={{ title: t('nav.qr') }} />
        <Stack.Screen name="Shortener" component={ShortenerScreen} options={{ title: t('nav.shortener') }} />
        <Stack.Screen name="Pastebin" component={PastebinScreen} options={{ title: t('nav.pastebin') }} />
        <Stack.Screen name="Share" component={ShareScreen} options={{ title: t('nav.share') }} />
        <Stack.Screen name="JsonFormatter" component={JsonFormatterScreen} options={{ title: t('nav.jsonFormatter') }} />
        <Stack.Screen name="Base64" component={Base64Screen} options={{ title: t('home.tools.base64Title') }} />
        <Stack.Screen name="Uuid" component={UuidScreen} options={{ title: t('home.tools.uuidTitle') }} />
        <Stack.Screen name="Jwt" component={JwtScreen} options={{ title: t('home.tools.jwtTitle') }} />
        <Stack.Screen name="ExportView" component={ExportViewScreen} options={{ title: t('home.tools.exportViewTitle') }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: t('home.privacyButtonTitle') }} />
        <Stack.Screen name="ToolHelp" component={ToolHelpScreen} options={{ title: t('nav.help') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AppNavigator />
    </TranslationProvider>
  );
}
