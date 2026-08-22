import Constants from 'expo-constants';

export const getInstalledVersion = () => (
  Constants.expoConfig?.version || Constants.nativeAppVersion || Constants.manifest2?.extra?.expoClient?.version || '0.0.0'
);
