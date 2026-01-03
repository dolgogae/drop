import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useI18n } from '../../contexts/i18n';
import styles from './styles';

type UserRole = 'MEMBER' | 'CROSSFIT_BOX';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // 영어 소문자, 숫자, 특수문자 각각 1개 이상 포함, 8자 이상
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;
  return hasLowercase && hasNumber && hasSpecialChar && hasMinLength;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // 실시간 유효성 검사 상태
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  const isEmailValid = useMemo(() => validateEmail(email), [email]);
  const isPasswordValid = useMemo(() => validatePassword(password), [password]);
  const isPasswordMatch = useMemo(() => password === passwordConfirm, [password, passwordConfirm]);

  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;
  const showPasswordError = passwordTouched && password.length > 0 && !isPasswordValid;
  const showPasswordMismatch = passwordConfirmTouched && passwordConfirm.length > 0 && !isPasswordMatch;

  const roles: { key: UserRole; labelKey: string; descKey: string }[] = [
    { key: 'MEMBER', labelKey: 'role.member', descKey: 'role.memberDesc' },
    { key: 'CROSSFIT_BOX', labelKey: 'role.crossfitBox', descKey: 'role.crossfitBoxDesc' },
  ];

  const handleNext = () => {
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
    if (!selectedRole) {
      Alert.alert(t('validation.selectRole'));
      return;
    }

    const baseInfo = { username, email, password };

    switch (selectedRole) {
      case 'MEMBER':
        router.push({
          pathname: '/register/member',
          params: baseInfo,
        });
        break;
      case 'CROSSFIT_BOX':
        router.push({
          pathname: '/register/crossfit-box',
          params: baseInfo,
        });
        break;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.register')}</Text>

        <Text style={styles.sectionTitle}>{t('role.title')}</Text>
        <View style={styles.roleContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.roleCard,
                selectedRole === role.key && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole(role.key)}
            >
              <View style={styles.radioOuter}>
                {selectedRole === role.key && <View style={styles.radioInner} />}
              </View>
              <View style={styles.roleTextContainer}>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === role.key && styles.roleLabelSelected,
                  ]}
                >
                  {t(role.labelKey)}
                </Text>
                <Text style={styles.roleDescription}>{t(role.descKey)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{t('common.next')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
          <Text style={styles.link}>{t('auth.goToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
