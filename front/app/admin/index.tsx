import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearTokens, clearProfile } from '../../store';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'edit-box',
    title: '박스 정보 관리',
    description: '박스 이름, 주소, 시설 정보를 수정합니다',
    icon: 'business-outline',
    route: '/admin/edit-box',
  },
  {
    id: 'schedule',
    title: '시간표 관리',
    description: '요일별 수업 시간표를 설정합니다',
    icon: 'calendar-outline',
    route: '/admin/schedule',
  },
  {
    id: 'reviews',
    title: '리뷰 관리',
    description: '회원들이 작성한 리뷰를 확인합니다',
    icon: 'chatbubble-ellipses-outline',
    route: '/admin/reviews',
  },
];

const AUTH_TOKENS_KEY = 'auth_tokens';
const AUTO_LOGIN_KEY = 'auto_login';
const PROFILE_KEY = 'profile';

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [boxName, setBoxName] = useState<string>('');

  useEffect(() => {
    loadBoxInfo();
  }, []);

  const loadBoxInfo = async () => {
    try {
      const profileStr = await AsyncStorage.getItem('profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setBoxName(profile.username || profile.name || 'Box');
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, AUTO_LOGIN_KEY, PROFILE_KEY]);
          dispatch(clearTokens());
          dispatch(clearProfile());
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>안녕하세요,</Text>
            <Text style={styles.boxName}>{boxName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>관리 메뉴</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={28} color="#588157" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  boxName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
});
