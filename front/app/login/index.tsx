import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { setTokens } from '../../store';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data = response.data;
      if (response.status === 200 && data.data?.accessToken) {
        dispatch(setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        }));
        Alert.alert(t('auth.loginSuccess'));
        router.replace('/');
      } else {
        Alert.alert(t('auth.loginFailed'), data.message || t('validation.error'));
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        Alert.alert(t('auth.loginFailed'), e.response.data.message);
      } else {
        Alert.alert(t('auth.loginFailed'), t('validation.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        placeholderTextColor="#A3B18A"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        placeholderTextColor="#A3B18A"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkBtn}>
        <Text style={styles.link}>{t('auth.goToRegister')}</Text>
      </TouchableOpacity>
    </View>
  );
}
