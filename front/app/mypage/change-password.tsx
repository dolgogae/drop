import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useI18n } from '../../contexts/i18n';
import axiosInstance from '../../utils/axiosInstance';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      Alert.alert(t('validation.fillAll'));
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(t('validation.invalidPassword'));
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      Alert.alert(t('validation.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch('/mypage/password', {
        currentPassword,
        newPassword,
      });
      Alert.alert(t('mypage.passwordChangeSuccess'));
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.message || t('validation.error');
      Alert.alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>{t('mypage.currentPassword')}</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder={t('mypage.currentPassword')}
            placeholderTextColor="#A3B18A"
          />

          <Text style={styles.label}>{t('mypage.newPassword')}</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder={t('mypage.newPassword')}
            placeholderTextColor="#A3B18A"
          />
          <Text style={styles.hint}>{t('validation.invalidPassword')}</Text>

          <Text style={styles.label}>{t('mypage.newPasswordConfirm')}</Text>
          <TextInput
            style={styles.input}
            value={newPasswordConfirm}
            onChangeText={setNewPasswordConfirm}
            secureTextEntry
            placeholder={t('mypage.newPasswordConfirm')}
            placeholderTextColor="#A3B18A"
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? t('common.loading') : t('mypage.save')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#344E41',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#344E41',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#A3B18A',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#588157',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#A3B18A',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
