import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CrossfitBoxSearch, { CrossfitBoxResult } from '../../components/CrossfitBoxSearch';
import axiosInstance from '../../utils/axiosInstance';

export default function MyBoxSelectScreen() {
  const router = useRouter();
  const [isSettingMyBox, setIsSettingMyBox] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSelectBox = async (crossfitBox: CrossfitBoxResult) => {
    setIsSettingMyBox(true);
    try {
      await axiosInstance.patch(`/mypage/home-box/${crossfitBox.id}`);
      Alert.alert('My Box 설정', `${crossfitBox.name}이(가) My Box로 설정되었습니다.`, [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('My Box 설정 실패:', error);
      Alert.alert('오류', 'My Box 설정에 실패했습니다.');
    } finally {
      setIsSettingMyBox(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Box 선택</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.description}>
            My Box로 설정할 박스를 검색하세요
          </Text>

          <CrossfitBoxSearch
            onSelect={handleSelectBox}
            placeholder="예: 크로스핏 XXX"
            rightIcon={<Ionicons name="home-outline" size={20} color="#588157" />}
            disabled={isSettingMyBox}
          />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});
