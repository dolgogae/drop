import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../constants/oauth';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  error?: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<GoogleAuthResult | null>(null);

  const redirectUri = makeRedirectUri({
    scheme: 'drop-front',
    preferLocalhost: false,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setAuthResult({
        success: true,
        idToken: authentication?.idToken || undefined,
        accessToken: authentication?.accessToken || undefined,
      });
      setIsLoading(false);
    } else if (response?.type === 'error') {
      setAuthResult({
        success: false,
        error: response.error?.message || 'Google 로그인 실패',
      });
      setIsLoading(false);
    } else if (response?.type === 'cancel') {
      setAuthResult({
        success: false,
        error: '로그인이 취소되었습니다.',
      });
      setIsLoading(false);
    }
  }, [response]);

  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setAuthResult(null);

    if (!request) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Google 로그인을 초기화할 수 없습니다. Client ID를 확인하세요.',
      };
    }

    try {
      const result = await promptAsync();

      if (result.type === 'success') {
        return {
          success: true,
          idToken: result.authentication?.idToken || undefined,
          accessToken: result.authentication?.accessToken || undefined,
        };
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: '로그인이 취소되었습니다.',
        };
      } else {
        return {
          success: false,
          error: 'Google 로그인 실패',
        };
      }
    } catch (error: any) {
      setIsLoading(false);
      return {
        success: false,
        error: error.message || 'Google 로그인 중 오류가 발생했습니다.',
      };
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    authResult,
    isReady: !!request,
  };
}
