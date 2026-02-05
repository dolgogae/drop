import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { useI18n } from '../../contexts/i18n';
import styles from './styles';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;
  return hasLowercase && hasNumber && hasSpecialChar && hasMinLength;
};

export default function MemberStandaloneRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [exampleColumn, setExampleColumn] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  const isEmailValid = useMemo(() => validateEmail(email), [email]);
  const isPasswordValid = useMemo(() => validatePassword(password), [password]);
  const isPasswordMatch = useMemo(() => password === passwordConfirm, [password, passwordConfirm]);

  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;
  const showPasswordError = passwordTouched && password.length > 0 && !isPasswordValid;
  const showPasswordMismatch = passwordConfirmTouched && passwordConfirm.length > 0 && !isPasswordMatch;

  const handleRegister = async () => {
    if (!username || !email || !password || !passwordConfirm) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    if (!isEmailValid) {
      Alert.alert(t('validation.invalidEmail'));
      return;
    }
    if (!isPasswordValid) {
      Alert.alert(t('validation.invalidPassword'));
      return;
    }
    if (!isPasswordMatch) {
      Alert.alert(t('validation.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/sign-up/member', {
        username,
        email,
        password,
        exampleColumn,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(t('auth.registerSuccess'), t('auth.redirectToLogin'));
        router.replace('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('validation.error');
      Alert.alert(t('auth.registerFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('member.title')}</Text>

        <Text style={styles.sectionTitle}>{t('info.basic')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.name')}
          placeholderTextColor="#A3B18A"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, showEmailError && styles.inputError]}
          placeholder={t('auth.email')}
          placeholderTextColor="#A3B18A"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {showEmailError && (
          <Text style={styles.errorText}>{t('validation.invalidEmail')}</Text>
        )}
        <TextInput
          style={[styles.input, showPasswordError && styles.inputError]}
          placeholder={t('auth.password')}
          placeholderTextColor="#A3B18A"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setPasswordTouched(true)}
          secureTextEntry
        />
        {showPasswordError && (
          <Text style={styles.errorText}>{t('validation.invalidPassword')}</Text>
        )}
        <TextInput
          style={[styles.input, showPasswordMismatch && styles.inputError]}
          placeholder={t('auth.passwordConfirm')}
          placeholderTextColor="#A3B18A"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          onBlur={() => setPasswordConfirmTouched(true)}
          secureTextEntry
        />
        {showPasswordMismatch && (
          <Text style={styles.errorText}>{t('validation.passwordMismatch')}</Text>
        )}

        <Text style={styles.sectionTitle}>{t('info.additional')}</Text>
        <TextInput
          style={styles.input}
          placeholder={`${t('member.additionalInfo')} ${t('common.optional')}`}
          placeholderTextColor="#A3B18A"
          value={exampleColumn}
          onChangeText={setExampleColumn}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('auth.registering') : t('auth.completeRegister')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
          <Text style={styles.link}>{t('auth.goToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
