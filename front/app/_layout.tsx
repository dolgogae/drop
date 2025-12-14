import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import LanguageToggle from '../components/LanguageToggle';
import { I18nProvider } from '../contexts/i18n';
import { RootState, store, setTokens } from '../store';

const AUTH_TOKENS_KEY = 'auth_tokens';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedTokens = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
        if (savedTokens) {
          const { accessToken, refreshToken } = JSON.parse(savedTokens);
          if (accessToken && refreshToken) {
            dispatch(setTokens({ accessToken, refreshToken }));
          }
        }
      } catch (error) {
        console.error('Failed to restore tokens:', error);
      }
      setIsLoading(false);
    };
    checkLogin();
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const inTabsGroup = segments[0] === '(tabs)';

    // 토큰이 없으면 /login, /register만 허용
    if (!accessToken) {
      if (!inAuthGroup) {
        router.replace('/login');
      }
      return;
    }

    // 토큰이 있으면 /login, /register 접근 시 탭 홈으로 리다이렉트
    if (accessToken) {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, accessToken, segments]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <LanguageToggle />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <I18nProvider>
        <RootLayoutNav />
      </I18nProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
