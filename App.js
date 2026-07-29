import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Updates from 'expo-updates';

import HomeScreen from './screens/HomeScreen';
import PasswordScreen from './screens/PasswordScreen';
import QRScreen from './screens/QRScreen';
import ShortenerScreen from './screens/ShortenerScreen';
import PastebinScreen from './screens/PastebinScreen';
import ShareScreen from './screens/ShareScreen';
import { TranslationProvider, useTranslation } from './i18n';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { t } = useTranslation();

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
    <NavigationContainer>
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
