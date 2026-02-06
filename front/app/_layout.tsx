import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { I18nProvider } from '../contexts/i18n';
import { RootState, setTokens, store } from '../store';

const AUTH_TOKENS_KEY = 'auth_tokens';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedTokens = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
        if (savedTokens) {
          const { accessToken, refreshToken, role } = JSON.parse(savedTokens);
          if (accessToken && refreshToken) {
            dispatch(setTokens({ accessToken, refreshToken, role }));
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
    const inAdminGroup = segments[0] === 'admin';

    if (!accessToken) {
      if (!inAuthGroup) {
        router.replace('/login');
      }
      return;
    }

    // 로그인된 상태에서 역할 기반 라우팅 (Redux의 role로 동기 판단)
    const isGym = role === 'GYM';

    if (isGym && !inAdminGroup) {
      router.replace('/admin');
      return;
    }

    if (!isGym && (inAdminGroup || inAuthGroup)) {
      router.replace('/(tabs)');
      return;
    }
  }, [isLoading, accessToken, role, segments]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
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
