import { Platform } from 'react-native';

// Expo SDK 53+에서는 EXPO_PUBLIC_ 접두사 환경변수를 process.env로 직접 접근
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

export const getGoogleClientId = (): string => {
  switch (Platform.OS) {
    case 'ios':
      return GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
    case 'android':
      return GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
    default:
      return GOOGLE_WEB_CLIENT_ID;
  }
};
