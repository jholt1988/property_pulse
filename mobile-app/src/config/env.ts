import Constants from 'expo-constants';

const fromExpo = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  fromExpo ||
  'http://127.0.0.1:3001/api';
