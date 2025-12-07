import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

type UserRole = 'MEMBER' | 'TRAINER' | 'GYM';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles: { key: UserRole; labelKey: string; descKey: string }[] = [
    { key: 'MEMBER', labelKey: 'role.member', descKey: 'role.memberDesc' },
    { key: 'TRAINER', labelKey: 'role.trainer', descKey: 'role.trainerDesc' },
    { key: 'GYM', labelKey: 'role.gym', descKey: 'role.gymDesc' },
  ];

  const handleNext = () => {
    if (!username || !email || !password || !passwordConfirm) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    if (password !== passwordConfirm) {
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
      case 'TRAINER':
        router.push({
          pathname: '/register/trainer',
          params: baseInfo,
        });
        break;
      case 'GYM':
        router.push({
          pathname: '/register/gym',
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
        <TextInput
          style={styles.input}
          placeholder={t('auth.passwordConfirm')}
          placeholderTextColor="#A3B18A"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

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
