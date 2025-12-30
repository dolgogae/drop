import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { clearTokens, clearProfile, setProfile, updateProfile, RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

const AUTH_TOKENS_KEY = 'auth_tokens';
const AUTO_LOGIN_KEY = 'auto_login';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function MyPageScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useI18n();
  const profile = useSelector((state: RootState) => state.user.profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/mypage/profile');
      if (response.data.data) {
        dispatch(setProfile(response.data.data));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('mypage.logout'),
      t('mypage.logoutConfirm'),
      [
        { text: t('mypage.cancel'), style: 'cancel' },
        {
          text: t('mypage.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.post('/mypage/logout');
            } catch (error) {
              console.error('Logout API error:', error);
            }
            await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, AUTO_LOGIN_KEY]);
            dispatch(clearTokens());
            dispatch(clearProfile());
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleWithdraw = () => {
    Alert.alert(
      t('mypage.withdraw'),
      t('mypage.withdrawConfirm'),
      [
        { text: t('mypage.cancel'), style: 'cancel' },
        {
          text: t('mypage.withdraw'),
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete('/mypage/withdraw');
              await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, AUTO_LOGIN_KEY]);
              dispatch(clearTokens());
              dispatch(clearProfile());
              Alert.alert(t('mypage.withdrawSuccess'));
              router.replace('/login');
            } catch (error) {
              console.error('Withdraw error:', error);
              Alert.alert(t('validation.error'));
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      await axiosInstance.patch('/mypage/notification', {
        notificationEnabled: value,
      });
      dispatch(updateProfile({ notificationEnabled: value }));
    } catch (error) {
      console.error('Notification toggle error:', error);
      Alert.alert(t('validation.error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('mypage.title')}</Text>

        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={() => router.push('/mypage/profile-image')}
          >
            {profile?.profileImage ? (
              <Image
                source={{ uri: `${API_BASE_URL}/image/${profile.profileImage}` }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#A3B18A" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.username}>{profile?.username || '-'}</Text>
          <Text style={styles.email}>{profile?.email || '-'}</Text>
        </View>

        {/* 메뉴 섹션 */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/mypage/edit-profile')}
          >
            <Ionicons name="person-outline" size={24} color="#344E41" />
            <Text style={styles.menuText}>{t('mypage.editProfile')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/mypage/change-password')}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#344E41" />
            <Text style={styles.menuText}>{t('mypage.changePassword')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#344E41" />
            <Text style={styles.menuText}>{t('mypage.notificationEnabled')}</Text>
            <Switch
              value={profile?.notificationEnabled ?? true}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#ddd', true: '#A3B18A' }}
              thumbColor={profile?.notificationEnabled ? '#588157' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 로그아웃/탈퇴 섹션 */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#588157" />
            <Text style={styles.logoutText}>{t('mypage.logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Text style={styles.withdrawText}>{t('mypage.withdraw')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#588157',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#344E41',
  },
  email: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#344E41',
    marginLeft: 12,
  },
  dangerSection: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#588157',
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#588157',
    marginLeft: 8,
    fontWeight: '600',
  },
  withdrawButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  withdrawText: {
    fontSize: 14,
    color: '#999',
  },
});
