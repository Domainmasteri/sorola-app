import Constants from 'expo-constants';

import { PUBLIC_BASE_URL } from './api';

const UPDATE_MANIFEST_URL = `${PUBLIC_BASE_URL}/lataukset/latest.json`;

const parseVersion = (value) => {
  if (typeof value !== 'string' || !/^\d+(?:\.\d+){0,2}$/.test(value)) return null;
  return value.split('.').map(Number);
};

export const isNewerVersion = (availableVersion, installedVersion) => {
  const available = parseVersion(availableVersion);
  const installed = parseVersion(installedVersion);
  if (!available || !installed) return false;

  for (let index = 0; index < 3; index += 1) {
    const difference = (available[index] || 0) - (installed[index] || 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
};

export const getInstalledVersion = () => (
  Constants.nativeAppVersion || Constants.expoConfig?.version || Constants.manifest2?.extra?.expoClient?.version || '0.0.0'
);

export async function getAvailableUpdate() {
  const response = await fetch(UPDATE_MANIFEST_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) return null;

  const manifest = await response.json();
  if (!isNewerVersion(manifest?.version, getInstalledVersion())) return null;
  if (!manifest.downloadUrl || typeof manifest.downloadUrl !== 'object') return null;

  return manifest;
}
