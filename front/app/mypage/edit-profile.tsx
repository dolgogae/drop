import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { updateProfile, RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const profile = useSelector((state: RootState) => state.user.profile);

  const [username, setUsername] = useState(profile?.username || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert(t('validation.fillAll'));
      return;
    }

    if (username.trim().length < 2 || username.trim().length > 20) {
      Alert.alert('닉네임은 2-20자 사이여야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch('/mypage/profile', { username: username.trim() });
      dispatch(updateProfile({ username: username.trim() }));
      Alert.alert(t('mypage.updateSuccess'));
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('mypage.editProfile')}</Text>
        <View style={styles.headerRight} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{t('mypage.nickname')}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={t('mypage.nickname')}
            placeholderTextColor="#A3B18A"
            maxLength={20}
            autoFocus
          />
          <Text style={styles.hint}>2-20자 사이로 입력해주세요.</Text>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? t('common.loading') : t('mypage.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  headerRight: {
    width: 40,
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
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#588157',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
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
