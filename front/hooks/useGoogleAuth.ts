import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AuthSessionResult, makeRedirectUri } from 'expo-auth-session';
import { useState, useEffect, useMemo } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
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
  redirectUri?: string;
}

const getProxyRedirectUri = () => {
  const owner = Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;

  if (!owner || !slug) {
    return null;
  }

  return `https://auth.expo.io/@${owner}/${slug}`;
};

const getErrorMessage = (response: AuthSessionResult | null) => {
  if (response?.type !== 'error') {
    return 'Google 로그인 실패';
  }

  const description =
    response.params?.error_description ||
    response.error?.description ||
    response.error?.message ||
    response.params?.error;

  return description || 'Google 로그인 실패';
};

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<GoogleAuthResult | null>(null);

  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const redirectUri = useMemo(() => {
    if (isExpoGo) {
      return getProxyRedirectUri();
    }

    return makeRedirectUri({
      scheme: 'drop-front',
      path: 'oauthredirect',
    });
  }, [isExpoGo]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: redirectUri || undefined,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setAuthResult({
        success: true,
        idToken: authentication?.idToken || undefined,
        accessToken: authentication?.accessToken || undefined,
        redirectUri: redirectUri || undefined,
      });
      setIsLoading(false);
    } else if (response?.type === 'error') {
      setAuthResult({
        success: false,
        error: getErrorMessage(response),
        redirectUri: redirectUri || undefined,
      });
      setIsLoading(false);
    } else if (response?.type === 'cancel') {
      setAuthResult({
        success: false,
        error: '로그인이 취소되었습니다.',
        redirectUri: redirectUri || undefined,
      });
      setIsLoading(false);
    } else if (response?.type === 'dismiss') {
      setAuthResult({
        success: false,
        error: '로그인이 취소되었습니다.',
        redirectUri: redirectUri || undefined,
      });
      setIsLoading(false);
    }
  }, [redirectUri, response]);

  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setAuthResult(null);

    if (!redirectUri) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Google 로그인 redirect URI를 계산할 수 없습니다. Expo owner/slug 설정을 확인하세요.',
      };
    }

    if (!request) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Google 로그인을 초기화할 수 없습니다. Client ID를 확인하세요.',
        redirectUri,
      };
    }

    try {
      console.log('[GoogleAuth] executionEnvironment:', Constants.executionEnvironment);
      console.log('[GoogleAuth] redirectUri:', redirectUri);
      console.log('[GoogleAuth] has client ids:', {
        web: !!GOOGLE_WEB_CLIENT_ID,
        ios: !!GOOGLE_IOS_CLIENT_ID,
        android: !!GOOGLE_ANDROID_CLIENT_ID,
      });

      const result = await promptAsync();

      if (result.type === 'success') {
        return {
          success: true,
          idToken: result.authentication?.idToken || undefined,
          accessToken: result.authentication?.accessToken || undefined,
          redirectUri,
        };
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: '로그인이 취소되었습니다.',
          redirectUri,
        };
      } else {
        return {
          success: false,
          error: getErrorMessage(result),
          redirectUri,
        };
      }
    } catch (error: any) {
      setIsLoading(false);
      return {
        success: false,
        error: error.message || 'Google 로그인 중 오류가 발생했습니다.',
        redirectUri,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    authResult,
    isReady: !!request,
  };
}
