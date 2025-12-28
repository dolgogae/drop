import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { clearTokens } from '../../store';

const AUTH_TOKENS_KEY = 'auth_tokens';
const AUTO_LOGIN_KEY = 'auto_login';

export default function MyPageScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, AUTO_LOGIN_KEY]);
            dispatch(clearTokens());
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>마이페이지</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#588157',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
