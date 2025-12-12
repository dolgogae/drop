import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { RootState, store } from '../store';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const checkLogin = async () => {
      await AsyncStorage.getItem('isLoggedIn');
      setIsLoading(false);
    };
    checkLogin();
  }, []);

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
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
