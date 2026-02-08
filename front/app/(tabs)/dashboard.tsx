import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HomeState, LocationMode } from '../../constants/enums';
import axiosInstance from '../../utils/axiosInstance';
import { crossfitBoxEvents } from '../../utils/crossfitBoxEvents';
import { getRecentlyViewedBoxes, RecentBox } from '../../utils/recentStorage';

interface MyCrossfitBoxPreview {
  crossfitBoxId: number;
  name: string;
  isFavorite: boolean;
  isDeleted: boolean;
  togglingFavorite?: boolean;
}

interface HomeBox {
  crossfitBoxId: number;
  name: string;
  addressLine1: string | null;
}

interface HomeSummary {
  homeBox: HomeBox | null;
  nearbyCrossfitBoxCount: number;
  nearbyBasis: LocationMode;
  myCrossfitBoxesPreview: MyCrossfitBoxPreview[];
  hasMoreMyCrossfitBoxes: boolean;
}

interface MyReview {
  reviewId: number;
  rating: number;
  content: string;
  crossfitBoxId: number;
  crossfitBoxName: string;
  createdAt: string;
  updatedAt: string;
}

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
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [recentlyViewedBoxes, setRecentlyViewedBoxes] = useState<RecentBox[]>([]);

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

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === Location.PermissionStatus.GRANTED) {
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

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = snapToGrid(location.coords.latitude);
      const lng = snapToGrid(location.coords.longitude);

      setCurrentLocation({ lat, lng });

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address) {
          let displayAddress = '';
          if (address.region) {
            const region = address.region.replace(/특별시|광역시|도$/g, '');
            const detail = address.subregion || address.district || '';
            displayAddress = detail ? `${region} ${detail}` : region;
          } else if (address.city) {
            displayAddress = address.district ? `${address.city} ${address.district}` : address.city;
          }
          setCurrentAddress(displayAddress || null);
        }
      } catch (geocodeError) {
        console.error('주소 변환 실패:', geocodeError);
      }

      return { lat, lng };
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      return null;
    }
  }, []);

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

      const response = await axiosInstance.get('/dashboard/summary', { params });

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

  const fetchMyReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/mypage/reviews', { params: { page: 0, size: 3 } });
      if (response.data?.data?.reviews) {
        setMyReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error('내 리뷰 조회 실패:', error);
    }
  }, []);

  const loadRecentlyViewedBoxes = useCallback(async () => {
    const boxes = await getRecentlyViewedBoxes();
    setRecentlyViewedBoxes(boxes);
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    const initializeHome = async () => {
      const permissionStatus = await checkLocationPermission();

      if (permissionStatus === Location.PermissionStatus.GRANTED) {
        const location = await getCurrentLocation();
        await fetchHomeSummary(location);
      } else if (permissionStatus === Location.PermissionStatus.DENIED) {
        setHomeState(HomeState.PERMISSION_DENIED);
      } else {
        await requestLocationPermission();
      }
    };

    initializeHome();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyReviews();
      loadRecentlyViewedBoxes();

      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      const refreshData = async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();

          const params: Record<string, any> = {};
          if (status === Location.PermissionStatus.GRANTED) {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            params.latGrid = snapToGrid(location.coords.latitude);
            params.lngGrid = snapToGrid(location.coords.longitude);
            params.locationMode = LocationMode.CURRENT;
          }

          const response = await axiosInstance.get('/dashboard/summary', { params });
          if (response.data?.data) {
            setSummary(response.data.data);
          }
        } catch (error) {
          console.error('홈 데이터 갱신 실패:', error);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    let lastFetchTime = Date.now();
    const REFRESH_INTERVAL = 10 * 60 * 1000;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
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

  useEffect(() => {
    const refreshCrossfitBoxes = async () => {
      try {
        const params: Record<string, any> = {};
        if (currentLocation) {
          params.latGrid = currentLocation.lat;
          params.lngGrid = currentLocation.lng;
          params.locationMode = LocationMode.CURRENT;
        }
        const response = await axiosInstance.get('/dashboard/summary', { params });
        if (response.data?.data) {
          setSummary(response.data.data);
        }
      } catch (error) {
        console.error('크로스핏박스 데이터 갱신 실패:', error);
      }
    };

    const unsubscribe = crossfitBoxEvents.subscribe(refreshCrossfitBoxes);
    return unsubscribe;
  }, [currentLocation]);

  const handleGoToMap = () => {
    if (currentLocation) {
      router.push({
        pathname: '/(tabs)',
        params: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          t: Date.now(),
        },
      });
    } else {
      router.push('/(tabs)');
    }
  };

  const handleGoToNearbyCrossfitBoxes = () => {
    if (currentLocation) {
      router.push({
        pathname: '/nearby-crossfit-boxes',
        params: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentAddress || '',
        },
      } as any);
    }
  };

  const handleGoToMyCrossfitBoxes = () => {
    router.push('/my-crossfit-boxes' as any);
  };

  const handleCrossfitBoxPress = (crossfitBox: MyCrossfitBoxPreview) => {
    if (crossfitBox.isDeleted) {
      return;
    }
    router.push(`/crossfit-box/${crossfitBox.crossfitBoxId}` as any);
  };

  const handleToggleFavorite = async (crossfitBoxId: number) => {
    if (!summary) return;

    setSummary({
      ...summary,
      myCrossfitBoxesPreview: summary.myCrossfitBoxesPreview.map((c) =>
        c.crossfitBoxId === crossfitBoxId ? { ...c, togglingFavorite: true } : c
      ),
    });

    try {
      const response = await axiosInstance.patch(`/member-crossfit-box/${crossfitBoxId}/favorite`);
      if (response.data?.data) {
        setSummary((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            myCrossfitBoxesPreview: prev.myCrossfitBoxesPreview.map((c) =>
              c.crossfitBoxId === crossfitBoxId
                ? { ...c, isFavorite: response.data.data.isFavorite, togglingFavorite: false }
                : c
            ),
          };
        });
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          myCrossfitBoxesPreview: prev.myCrossfitBoxesPreview.map((c) =>
            c.crossfitBoxId === crossfitBoxId ? { ...c, togglingFavorite: false } : c
          ),
        };
      });
    }
  };

  const handleRemoveCrossfitBox = async (crossfitBoxId: number) => {
    try {
      await axiosInstance.delete(`/member-crossfit-box/${crossfitBoxId}`);
      if (summary) {
        setSummary({
          ...summary,
          myCrossfitBoxesPreview: summary.myCrossfitBoxesPreview.filter((c) => c.crossfitBoxId !== crossfitBoxId),
        });
      }
      crossfitBoxEvents.emit();
    } catch (error) {
      console.error('크로스핏박스 제거 실패:', error);
    }
  };

  const handleRetry = () => {
    if (locationPermission === Location.PermissionStatus.GRANTED) {
      getCurrentLocation().then((location) => fetchHomeSummary(location));
    } else {
      fetchHomeSummary();
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const continueWithoutLocation = () => {
    fetchHomeSummary();
  };

  if (homeState === HomeState.LOADING) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 스켈레톤: 주변 박스 */}
          <View style={[styles.summaryCard, styles.skeleton]}>
            <View style={[styles.skeletonText, { width: '50%', height: 20 }]} />
            <View style={[styles.skeletonButton, { marginTop: 10 }]} />
          </View>

          {/* 스켈레톤: 즐겨찾기 */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.boxChip, styles.skeleton]}>
                <View style={[styles.skeletonText, { width: '70%', height: 14 }]} />
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (homeState === HomeState.PERMISSION_DENIED) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 권한 안내 카드 */}
          <View style={styles.permissionCard}>
            <Ionicons name="location-outline" size={48} color="#588157" />
            <Text style={styles.permissionTitle}>위치 권한이 필요해요</Text>
            <Text style={styles.permissionDescription}>
              근처 박스를 찾으려면 위치 권한이 필요합니다.
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
      </SafeAreaView>
    );
  }

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
      </SafeAreaView>
    );
  }

  const isMyCrossfitBoxesEmpty = !summary?.myCrossfitBoxesPreview || summary.myCrossfitBoxesPreview.length === 0;

  const handleHomeBoxPress = () => {
    if (summary?.homeBox) {
      router.push(`/crossfit-box/${summary.homeBox.crossfitBoxId}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 1. 주변 박스 */}
        <View style={styles.nearbyCard}>
          <TouchableOpacity
            style={styles.nearbyRow}
            onPress={handleGoToNearbyCrossfitBoxes}
            activeOpacity={0.7}
            disabled={!currentLocation}
          >
            <Ionicons name="location" size={20} color="#588157" />
            <Text style={styles.nearbyText}>
              근처 박스 <Text style={styles.nearbyCount}>{summary?.nearbyCrossfitBoxCount || 0}</Text>개
            </Text>
            {currentAddress && <Text style={styles.nearbyAddress} numberOfLines={1}>{currentAddress}</Text>}
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton} onPress={handleGoToMap} activeOpacity={0.7}>
            <Ionicons name="map-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.mapButtonText}>지도에서 보기</Text>
          </TouchableOpacity>
        </View>

        {/* 2. My Box */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {summary?.homeBox && (
              <TouchableOpacity onPress={() => router.push('/my-box/select' as any)}>
                <Text style={styles.moreButton}>변경</Text>
              </TouchableOpacity>
            )}
          </View>
          {summary?.homeBox ? (
            <TouchableOpacity style={styles.rowCard} onPress={handleHomeBoxPress} activeOpacity={0.7}>
              <Ionicons name="home" size={20} color="#588157" />
              <View style={styles.rowCardInfo}>
                <Text style={styles.rowCardTitle} numberOfLines={1}>{summary.homeBox.name}</Text>
                {summary.homeBox.addressLine1 && (
                  <Text style={styles.rowCardSub} numberOfLines={1}>{summary.homeBox.addressLine1}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/my-box/select' as any)} activeOpacity={0.7}>
              <Ionicons name="home-outline" size={24} color="#A3B18A" />
              <View style={styles.emptyCardTextWrap}>
                <Text style={styles.emptyCardTitle}>나의 박스를 설정해보세요</Text>
                <Text style={styles.emptyCardSub}>자주 가는 박스를 빠르게 확인</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. 즐겨찾기 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>즐겨찾기</Text>
            {(summary?.hasMoreMyCrossfitBoxes || (summary?.myCrossfitBoxesPreview && summary.myCrossfitBoxesPreview.length > 0)) && (
              <TouchableOpacity onPress={handleGoToMyCrossfitBoxes}>
                <Text style={styles.moreButton}>더보기</Text>
              </TouchableOpacity>
            )}
          </View>
          {isMyCrossfitBoxesEmpty ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={36} color="#A3B18A" />
              <Text style={styles.emptyText}>아직 등록된 박스가 없어요</Text>
              <TouchableOpacity style={styles.emptyActionButton} onPress={handleGoToMap}>
                <Ionicons name="map-outline" size={16} color="#fff" />
                <Text style={styles.emptyActionButtonText}>지도에서 추가</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {summary?.myCrossfitBoxesPreview.map((crossfitBox) => (
                <TouchableOpacity
                  key={crossfitBox.crossfitBoxId}
                  style={[styles.boxChip, crossfitBox.isDeleted && styles.boxChipDeleted]}
                  onPress={() => handleCrossfitBoxPress(crossfitBox)}
                  activeOpacity={crossfitBox.isDeleted ? 1 : 0.7}
                >
                  {!crossfitBox.isDeleted && (
                    <TouchableOpacity
                      style={styles.chipFavButton}
                      onPress={(e) => { e.stopPropagation(); handleToggleFavorite(crossfitBox.crossfitBoxId); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={crossfitBox.togglingFavorite}
                    >
                      {crossfitBox.togglingFavorite ? (
                        <ActivityIndicator size="small" color="#FFD700" />
                      ) : (
                        <Ionicons
                          name={crossfitBox.isFavorite ? 'star' : 'star-outline'}
                          size={14}
                          color={crossfitBox.isFavorite ? '#FFD700' : '#ccc'}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.chipRemoveButton}
                    onPress={(e) => { e.stopPropagation(); handleRemoveCrossfitBox(crossfitBox.crossfitBoxId); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={12} color="#999" />
                  </TouchableOpacity>
                  <View style={styles.chipContent}>
                    {crossfitBox.isDeleted && <Ionicons name="alert-circle" size={14} color="#e63946" style={{ marginRight: 2 }} />}
                    <Text
                      style={[styles.chipName, crossfitBox.isDeleted && styles.chipNameDeleted]}
                      numberOfLines={2}
                    >
                      {crossfitBox.isDeleted ? '없어진 박스' : crossfitBox.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 4. 최근 본 박스 */}
        {recentlyViewedBoxes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 본 박스</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {recentlyViewedBoxes.map((box) => (
                <TouchableOpacity
                  key={box.id}
                  style={styles.boxChipSimple}
                  onPress={() => router.push(`/crossfit-box/${box.id}` as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipName} numberOfLines={2}>{box.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. 내 리뷰 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 리뷰</Text>
          </View>
          <TouchableOpacity style={styles.rowCard} onPress={() => router.push('/my-reviews' as any)} activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#588157" />
            <View style={styles.rowCardInfo}>
              <Text style={styles.rowCardTitle}>내가 작성한 리뷰</Text>
              <Text style={styles.rowCardSub}>
                {myReviews.length > 0 ? `최근 리뷰 ${myReviews.length}개` : '작성한 리뷰가 없어요'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
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
    padding: 14,
    paddingBottom: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  /* 주변 박스 (한 묶음 카드) */
  nearbyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#344E41',
  },
  nearbyCount: {
    fontWeight: 'bold',
    color: '#588157',
  },
  nearbyAddress: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginRight: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#588157',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* 공통 Row 카드 (My Box, 내 리뷰 등) */
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rowCardInfo: {
    flex: 1,
  },
  rowCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#344E41',
  },
  rowCardSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },

  /* My Box 빈 상태 */
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCardTextWrap: {
    flex: 1,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  emptyCardSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },

  /* 섹션 블록 */
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  moreButton: {
    fontSize: 13,
    color: '#588157',
  },

  /* 가로 스크롤 */
  horizontalScroll: {
    marginHorizontal: -14,
  },
  horizontalScrollContent: {
    paddingHorizontal: 14,
  },

  /* 즐겨찾기 칩 */
  boxChip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 6,
    marginRight: 10,
    width: 96,
    height: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChipDeleted: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e63946',
    borderStyle: 'dashed',
  },
  chipFavButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#344E41',
    textAlign: 'center',
  },
  chipNameDeleted: {
    color: '#999',
    fontStyle: 'italic',
  },

  /* 최근 본 Box 심플 칩 */
  boxChipSimple: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 80,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* 즐겨찾기 빈 상태 */
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588157',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 4,
  },
  emptyActionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  /* 에러 / 로딩 / 권한 */
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#588157',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginTop: 14,
    marginBottom: 6,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionButtons: {
    width: '100%',
    gap: 10,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#588157',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  permissionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#588157',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionButtonTextSecondary: {
    color: '#588157',
  },

  /* 스켈레톤 */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  skeleton: {
    overflow: 'hidden',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    height: 40,
    width: '100%',
  },
});
