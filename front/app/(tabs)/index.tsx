import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';

const { width } = Dimensions.get('window');

interface MyGymPreview {
  gymId: number;
  name: string;
  isFavorite: boolean;
}

interface HomeSummary {
  nearbyGymCount: number;
  nearbyBasis: 'current' | 'last';
  myGymsPreview: MyGymPreview[];
  hasMoreMyGyms: boolean;
}

type HomeState = 'loading' | 'success' | 'empty' | 'error';

export default function HomeScreen() {
  const router = useRouter();
  const [homeState, setHomeState] = useState<HomeState>('loading');
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchHomeSummary = useCallback(async () => {
    try {
      setHomeState('loading');
      setErrorMessage('');

      const response = await axiosInstance.get('/home/summary');

      if (response.data?.data) {
        const data: HomeSummary = response.data.data;
        setSummary(data);
        setHomeState('success');
      } else {
        setHomeState('error');
        setErrorMessage('데이터를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('홈 데이터 조회 실패:', error);
      setHomeState('error');
      setErrorMessage('네트워크 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    fetchHomeSummary();
  }, [fetchHomeSummary]);

  // 앱 포그라운드 복귀 시 데이터 갱신
  useEffect(() => {
    let lastFetchTime = Date.now();
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10분

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const now = Date.now();
        if (now - lastFetchTime > REFRESH_INTERVAL) {
          fetchHomeSummary();
          lastFetchTime = now;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [fetchHomeSummary]);

  const handleGoToMap = () => {
    router.push('/(tabs)/map');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleGymPress = (gymId: number) => {
    // TODO: 체육관 상세 페이지로 이동
    console.log('체육관 상세:', gymId);
  };

  const handleRetry = () => {
    fetchHomeSummary();
  };

  // 로딩 상태 - 스켈레톤 UI
  if (homeState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 스켈레톤: 근처 요약 카드 */}
          <View style={[styles.summaryCard, styles.skeleton]}>
            <View style={[styles.skeletonText, { width: '60%', height: 28 }]} />
            <View style={[styles.skeletonText, { width: '40%', height: 14, marginTop: 8 }]} />
            <View style={[styles.skeletonButton, { marginTop: 20 }]} />
          </View>

          {/* 스켈레톤: 내 체육관 미리보기 */}
          <View style={styles.sectionHeader}>
            <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gymPreviewScroll}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.gymPreviewCard, styles.skeleton]}>
                <View style={[styles.skeletonText, { width: '70%', height: 16 }]} />
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 오류 상태
  if (homeState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="cloud-offline-outline" size={64} color="#A3B18A" />
          <Text style={styles.errorText}>{errorMessage || '문제가 발생했습니다.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleRegister}
          accessibilityLabel="체육관 등록"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isMyGymsEmpty = !summary?.myGymsPreview || summary.myGymsPreview.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 근처 요약 카드 */}
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={handleGoToMap}
          activeOpacity={0.8}
          accessibilityLabel={`근처 체육관 ${summary?.nearbyGymCount || 0}개`}
          accessibilityRole="button"
        >
          <Text style={styles.summaryTitle}>
            근처 체육관 <Text style={styles.summaryCount}>{summary?.nearbyGymCount || 0}</Text>개
          </Text>
          <Text style={styles.summarySubtitle}>
            {summary?.nearbyBasis === 'current' ? '현재 위치 기준' : '마지막으로 본 위치'}
          </Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleGoToMap}>
            <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.mapButtonText}>지도에서 보기</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 내 체육관 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 체육관</Text>
          {summary?.hasMoreMyGyms && (
            <TouchableOpacity>
              <Text style={styles.moreButton}>더보기</Text>
            </TouchableOpacity>
          )}
        </View>

        {isMyGymsEmpty ? (
          // 빈 상태
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color="#A3B18A" />
            <Text style={styles.emptyText}>아직 등록된 체육관이 없어요</Text>
            <TouchableOpacity style={styles.emptyRegisterButton} onPress={handleRegister}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyRegisterButtonText}>체육관 등록하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 내 체육관 미리보기 리스트
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.gymPreviewScroll}
            contentContainerStyle={styles.gymPreviewScrollContent}
          >
            {summary?.myGymsPreview.map((gym) => (
              <TouchableOpacity
                key={gym.gymId}
                style={styles.gymPreviewCard}
                onPress={() => handleGymPress(gym.gymId)}
                activeOpacity={0.7}
              >
                <View style={styles.gymPreviewContent}>
                  <Text style={styles.gymPreviewName} numberOfLines={1}>
                    {gym.name}
                  </Text>
                  {gym.isFavorite && (
                    <Ionicons name="star" size={16} color="#FFD700" style={styles.favoriteIcon} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* FAB - 등록 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleRegister}
        accessibilityLabel="체육관 등록"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // 근처 요약 카드
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#344E41',
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#588157',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  moreButton: {
    fontSize: 14,
    color: '#588157',
  },

  // 내 체육관 미리보기
  gymPreviewScroll: {
    marginHorizontal: -16,
  },
  gymPreviewScrollContent: {
    paddingHorizontal: 16,
  },
  gymPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gymPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gymPreviewName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#344E41',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 6,
  },

  // 빈 상태
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyRegisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyRegisterButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },

  // 오류 상태
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#588157',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  // 스켈레톤
  skeleton: {
    overflow: 'hidden',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    height: 48,
    width: '100%',
  },
});
