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
    const inAdminGroup = segments[0] === 'admin';

    if (!accessToken) {
      if (!inAuthGroup) {
        router.replace('/login');
      }
      return;
    }

    // 로그인된 상태에서 역할 기반 라우팅
    const checkRoleAndRedirect = async () => {
      try {
        const profileStr = await AsyncStorage.getItem('profile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          const isGym = profile.role === 'GYM';

          // GYM 사용자가 어드민이 아닌 곳에 있을 때
          if (isGym && !inAdminGroup) {
            router.replace('/admin');
            return;
          }

          // 일반 사용자가 어드민에 있거나 로그인 페이지에 있을 때
          if (!isGym && (inAdminGroup || inAuthGroup)) {
            router.replace('/(tabs)');
            return;
          }
        } else if (inAuthGroup) {
          // 프로필이 없으면 일반 탭으로
          router.replace('/(tabs)');
        }
      } catch (error) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    };

    checkRoleAndRedirect();
  }, [isLoading, accessToken, segments]);

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
