import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, NativeModules, Platform, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import FeedbackScreen from './screens/FeedbackScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { TranslationProvider, useTranslation } from './i18n';
import { ThemeProvider, useTheme } from './src/theme';
import { getAvailableUpdate, getInstalledVersion } from './src/services/appUpdate';

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

function AppNavigator({ hasCompletedOnboarding, onCompleteOnboarding }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  return (
    <>
      <StatusBar style={colors.name === 'dark' ? 'light' : 'dark'} backgroundColor={colors.surface} />
      <NavigationContainer
      ref={navigationRef}
      theme={{
        ...(colors.name === 'dark' ? DarkTheme : DefaultTheme),
        dark: colors.name === 'dark',
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
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
        initialRouteName={hasCompletedOnboarding ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
          {() => <OnboardingScreen onComplete={onCompleteOnboarding} />}
        </Stack.Screen>
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
        <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: t('feedback.title') }} />
        <Stack.Screen name="ToolHelp" component={ToolHelpScreen} options={{ title: t('nav.help') }} />
      </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function UpdateCheck() {
  const { language, t } = useTranslation();
  const hasCheckedForUpdate = useRef(false);

  useEffect(() => {
    if (hasCheckedForUpdate.current) return;
    hasCheckedForUpdate.current = true;

    getAvailableUpdate()
      .then((update) => {
        const downloadUrl = update?.downloadUrl?.[language] || update?.downloadUrl?.en;
        if (!downloadUrl) return;

        Alert.alert(
          t('update.title'),
          t('update.message', { version: update.version, currentVersion: getInstalledVersion() }),
          [
            { text: t('update.later'), style: 'cancel' },
            {
              text: t('update.download'),
              onPress: () => Linking.openURL(downloadUrl).catch(() => {}),
            },
          ],
        );
      })
      .catch(() => {
        // The update check is optional and must not interfere with app startup.
      });
  }, [language, t]);

  return null;
}

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('sorola.onboarding.completed')
      .then((value) => setHasCompletedOnboarding(value === 'true'))
      .catch(() => setHasCompletedOnboarding(false));
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('sorola.onboarding.completed', 'true');
    } catch {
      // Continue to the app even if storage is temporarily unavailable.
    }
    setHasCompletedOnboarding(true);
  };

  return (
    <TranslationProvider>
      <ThemeProvider>
        <UpdateCheck />
        {hasCompletedOnboarding === null ? (
          <View style={styles.loading}>
            <StatusBar style="light" backgroundColor="#0b0d13" />
            <ActivityIndicator color="#ffaa00" />
          </View>
        ) : (
          <AppNavigator
            key={hasCompletedOnboarding ? 'main' : 'onboarding'}
            hasCompletedOnboarding={hasCompletedOnboarding}
            onCompleteOnboarding={completeOnboarding}
          />
        )}
      </ThemeProvider>
    </TranslationProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0d13' },
});
