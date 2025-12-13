import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
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
import * as Location from 'expo-location';
import axiosInstance from '../../utils/axiosInstance';
import { HomeState, LocationMode, LocationModeText } from '../../constants/enums';

const { width } = Dimensions.get('window');

interface MyGymPreview {
  gymId: number;
  name: string;
  isFavorite: boolean;
  isDeleted: boolean;
}

interface HomeSummary {
  nearbyGymCount: number;
  nearbyBasis: LocationMode;
  myGymsPreview: MyGymPreview[];
  hasMoreMyGyms: boolean;
}

// 위치를 그리드로 스냅 (프라이버시 보호 - 약 500m 단위)
const snapToGrid = (value: number, gridSize: number = 0.005): number => {
  return Math.round(value / gridSize) * gridSize;
};

export default function HomeScreen() {
  const router = useRouter();
  const [homeState, setHomeState] = useState<HomeState>(HomeState.LOADING);
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 위치 권한 확인 및 요청
  const checkLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      return status;
    } catch (error) {
      console.error('위치 권한 확인 실패:', error);
      return null;
    }
  }, []);

  // 위치 권한 요청
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === Location.PermissionStatus.GRANTED) {
        // 권한 허용되면 위치 가져오기
        await getCurrentLocation();
        fetchHomeSummary();
      } else {
        setHomeState(HomeState.PERMISSION_DENIED);
      }
    } catch (error) {
      console.error('위치 권한 요청 실패:', error);
      setHomeState(HomeState.PERMISSION_DENIED);
    }
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = snapToGrid(location.coords.latitude);
      const lng = snapToGrid(location.coords.longitude);

      setCurrentLocation({ lat, lng });
      return { lat, lng };
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      return null;
    }
  }, []);

  // 홈 데이터 조회
  const fetchHomeSummary = useCallback(async (location?: { lat: number; lng: number } | null) => {
    try {
      setHomeState(HomeState.LOADING);
      setErrorMessage('');

      const params: Record<string, any> = {};

      const loc = location || currentLocation;
      if (loc) {
        params.latGrid = loc.lat;
        params.lngGrid = loc.lng;
        params.locationMode = LocationMode.CURRENT;
      }

      const response = await axiosInstance.get('/home/summary', { params });

      if (response.data?.data) {
        const data: HomeSummary = response.data.data;
        setSummary(data);
        setHomeState(HomeState.SUCCESS);
      } else {
        setHomeState(HomeState.ERROR);
        setErrorMessage('데이터를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('홈 데이터 조회 실패:', error);
      setHomeState(HomeState.ERROR);
      setErrorMessage('네트워크 오류가 발생했습니다.');
    }
  }, [currentLocation]);

  // 초기 로딩
  useEffect(() => {
    const initializeHome = async () => {
      const permissionStatus = await checkLocationPermission();

      if (permissionStatus === Location.PermissionStatus.GRANTED) {
        const location = await getCurrentLocation();
        await fetchHomeSummary(location);
      } else if (permissionStatus === Location.PermissionStatus.DENIED) {
        // 이전에 거부한 경우 - 권한 없이 데이터 로드
        setHomeState(HomeState.PERMISSION_DENIED);
      } else {
        // 아직 결정하지 않은 경우 - 권한 요청
        await requestLocationPermission();
      }
    };

    initializeHome();
  }, []);

  // 앱 포그라운드 복귀 시 데이터 갱신
  useEffect(() => {
    let lastFetchTime = Date.now();
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10분

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // 권한 상태 다시 확인 (설정에서 변경했을 수 있음)
        const status = await checkLocationPermission();

        const now = Date.now();
        if (now - lastFetchTime > REFRESH_INTERVAL) {
          if (status === Location.PermissionStatus.GRANTED) {
            const location = await getCurrentLocation();
            fetchHomeSummary(location);
          } else {
            fetchHomeSummary();
          }
          lastFetchTime = now;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [fetchHomeSummary, checkLocationPermission, getCurrentLocation]);

  const handleGoToMap = () => {
    router.push('/(tabs)/map');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleGymPress = (gym: MyGymPreview) => {
    if (gym.isDeleted) {
      // 삭제된 체육관은 클릭 불가
      return;
    }
    // TODO: 체육관 상세 페이지로 이동
    console.log('체육관 상세:', gym.gymId);
  };

  // 내 체육관에서 제거
  const handleRemoveGym = async (gymId: number) => {
    try {
      await axiosInstance.delete(`/member-gym/${gymId}`);
      // 성공 시 목록에서 제거
      if (summary) {
        setSummary({
          ...summary,
          myGymsPreview: summary.myGymsPreview.filter((g) => g.gymId !== gymId),
        });
      }
    } catch (error) {
      console.error('체육관 제거 실패:', error);
    }
  };

  const handleRetry = () => {
    if (locationPermission === Location.PermissionStatus.GRANTED) {
      getCurrentLocation().then((location) => fetchHomeSummary(location));
    } else {
      fetchHomeSummary();
    }
  };

  // 설정 앱 열기
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // 위치 권한 없이 계속 진행
  const continueWithoutLocation = () => {
    fetchHomeSummary();
  };

  // 로딩 상태 - 스켈레톤 UI
  if (homeState === HomeState.LOADING) {
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

  // 위치 권한 거부 상태 (FR-6)
  if (homeState === HomeState.PERMISSION_DENIED) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 권한 안내 카드 */}
          <View style={styles.permissionCard}>
            <Ionicons name="location-outline" size={48} color="#588157" />
            <Text style={styles.permissionTitle}>위치 권한이 필요해요</Text>
            <Text style={styles.permissionDescription}>
              근처 체육관을 찾으려면 위치 권한이 필요합니다.
              {'\n'}권한을 허용하시거나 주소로 검색해보세요.
            </Text>

            <View style={styles.permissionButtons}>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={locationPermission === Location.PermissionStatus.DENIED ? openSettings : requestLocationPermission}
              >
                <Ionicons name="location" size={18} color="#fff" />
                <Text style={styles.permissionButtonText}>
                  {locationPermission === Location.PermissionStatus.DENIED ? '설정에서 허용' : '권한 허용'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.permissionButton, styles.permissionButtonSecondary]}
                onPress={continueWithoutLocation}
              >
                <Ionicons name="search" size={18} color="#588157" />
                <Text style={[styles.permissionButtonText, styles.permissionButtonTextSecondary]}>
                  위치 없이 계속
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

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

  // 오류 상태
  if (homeState === HomeState.ERROR) {
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
            {summary?.nearbyBasis === LocationMode.CURRENT
              ? LocationModeText[LocationMode.CURRENT]
              : '전체 체육관'}
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
                style={[
                  styles.gymPreviewCard,
                  gym.isDeleted && styles.gymPreviewCardDeleted,
                ]}
                onPress={() => handleGymPress(gym)}
                activeOpacity={gym.isDeleted ? 1 : 0.7}
              >
                {/* X 버튼 (우상단) */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveGym(gym.gymId)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={16} color="#999" />
                </TouchableOpacity>

                <View style={styles.gymPreviewContent}>
                  {gym.isDeleted && (
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color="#e63946"
                      style={styles.deletedIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.gymPreviewName,
                      gym.isDeleted && styles.gymPreviewNameDeleted,
                    ]}
                    numberOfLines={1}
                  >
                    {gym.isDeleted ? '없어진 체육관' : gym.name}
                  </Text>
                  {!gym.isDeleted && gym.isFavorite && (
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

  // 권한 안내 카드 (FR-6)
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#344E41',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButtons: {
    width: '100%',
    gap: 12,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  permissionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#588157',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionButtonTextSecondary: {
    color: '#588157',
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
    paddingTop: 24,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  gymPreviewCardDeleted: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e63946',
    borderStyle: 'dashed',
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
  gymPreviewNameDeleted: {
    color: '#999',
    fontStyle: 'italic',
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  deletedIcon: {
    marginRight: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
