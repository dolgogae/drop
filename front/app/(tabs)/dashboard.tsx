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
          {/* 스켈레톤: 근처 요약 카드 */}
          <View style={[styles.summaryCard, styles.skeleton]}>
            <View style={[styles.skeletonText, { width: '60%', height: 28 }]} />
            <View style={[styles.skeletonText, { width: '40%', height: 14, marginTop: 8 }]} />
            <View style={[styles.skeletonButton, { marginTop: 20 }]} />
          </View>

          {/* 스켈레톤: 내 크로스핏박스 미리보기 */}
          <View style={styles.sectionHeader}>
            <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.crossfitBoxPreviewScroll}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.crossfitBoxPreviewCard, styles.skeleton]}>
                <View style={[styles.skeletonText, { width: '70%', height: 16 }]} />
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
              근처 Box를 찾으려면 위치 권한이 필요합니다.
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
        {/* 1. My Box 섹션 (가로 꽉 차게) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Box</Text>
          {summary?.homeBox && (
            <TouchableOpacity onPress={() => router.push('/my-box/select' as any)}>
              <Text style={styles.moreButton}>변경</Text>
            </TouchableOpacity>
          )}
        </View>
        {summary?.homeBox ? (
          <TouchableOpacity
            style={styles.homeBoxCard}
            onPress={handleHomeBoxPress}
            activeOpacity={0.7}
          >
            <View style={styles.homeBoxContent}>
              <Ionicons name="home" size={24} color="#588157" />
              <View style={styles.homeBoxInfo}>
                <Text style={styles.homeBoxName}>{summary.homeBox.name}</Text>
                {summary.homeBox.addressLine1 && (
                  <Text style={styles.homeBoxAddress} numberOfLines={1}>
                    {summary.homeBox.addressLine1}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.homeBoxEmptyCard}
            onPress={() => router.push('/my-box/select' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={32} color="#A3B18A" />
            <Text style={styles.homeBoxEmptyText}>My Box를 설정해보세요</Text>
            <Text style={styles.homeBoxEmptySubText}>자주 가는 박스를 My Box로 설정하면 빠르게 확인할 수 있어요</Text>
          </TouchableOpacity>
        )}

        {/* 2. 즐겨찾기 섹션 */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>즐겨찾기</Text>
          {(summary?.hasMoreMyCrossfitBoxes || (summary?.myCrossfitBoxesPreview && summary.myCrossfitBoxesPreview.length > 0)) && (
            <TouchableOpacity onPress={handleGoToMyCrossfitBoxes}>
              <Text style={styles.moreButton}>더보기</Text>
            </TouchableOpacity>
          )}
        </View>

        {isMyCrossfitBoxesEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color="#A3B18A" />
            <Text style={styles.emptyText}>아직 등록된 Box가 없어요</Text>
            <TouchableOpacity style={styles.emptyRegisterButton} onPress={handleGoToMap}>
              <Ionicons name="map-outline" size={20} color="#fff" />
              <Text style={styles.emptyRegisterButtonText}>지도에서 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.crossfitBoxPreviewScroll}
            contentContainerStyle={styles.crossfitBoxPreviewScrollContent}
          >
            {summary?.myCrossfitBoxesPreview.map((crossfitBox) => (
              <TouchableOpacity
                key={crossfitBox.crossfitBoxId}
                style={[
                  styles.crossfitBoxPreviewCard,
                  crossfitBox.isDeleted && styles.crossfitBoxPreviewCardDeleted,
                ]}
                onPress={() => handleCrossfitBoxPress(crossfitBox)}
                activeOpacity={crossfitBox.isDeleted ? 1 : 0.7}
              >
                {!crossfitBox.isDeleted && (
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(crossfitBox.crossfitBoxId);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={crossfitBox.togglingFavorite}
                  >
                    {crossfitBox.togglingFavorite ? (
                      <ActivityIndicator size="small" color="#FFD700" />
                    ) : (
                      <Ionicons
                        name={crossfitBox.isFavorite ? 'star' : 'star-outline'}
                        size={18}
                        color={crossfitBox.isFavorite ? '#FFD700' : '#ccc'}
                      />
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveCrossfitBox(crossfitBox.crossfitBoxId);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={16} color="#999" />
                </TouchableOpacity>

                <View style={styles.crossfitBoxPreviewContent}>
                  {crossfitBox.isDeleted && (
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color="#e63946"
                      style={styles.deletedIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.crossfitBoxPreviewName,
                      crossfitBox.isDeleted && styles.crossfitBoxPreviewNameDeleted,
                    ]}
                    numberOfLines={2}
                  >
                    {crossfitBox.isDeleted ? '없어진 Box' : crossfitBox.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 3. 주변 박스 섹션 */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>주변 박스</Text>
        </View>
        <View style={styles.nearbyCard}>
          <TouchableOpacity
            onPress={handleGoToNearbyCrossfitBoxes}
            activeOpacity={0.7}
            accessibilityLabel={`근처 Box ${summary?.nearbyCrossfitBoxCount || 0}개`}
            accessibilityRole="button"
            disabled={!currentLocation}
            style={styles.nearbyContent}
          >
            <View style={styles.nearbyLeft}>
              <Ionicons name="location" size={24} color="#588157" />
              <View style={styles.nearbyInfo}>
                <Text style={styles.nearbyTitle}>
                  근처 Box <Text style={styles.nearbyCount}>{summary?.nearbyCrossfitBoxCount || 0}</Text>개
                </Text>
                {currentAddress && (
                  <Text style={styles.nearbyAddress}>{currentAddress}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton} onPress={handleGoToMap}>
            <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.mapButtonText}>지도에서 보기</Text>
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
    padding: 16,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  homeBoxCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  homeBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeBoxInfo: {
    flex: 1,
    marginLeft: 12,
  },
  homeBoxName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  homeBoxAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  homeBoxEmptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  homeBoxEmptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  homeBoxEmptySubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  nearbyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nearbyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nearbyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nearbyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  nearbyCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#588157',
  },
  nearbyAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  crossfitBoxPreviewScroll: {
    marginHorizontal: -16,
  },
  crossfitBoxPreviewScrollContent: {
    paddingHorizontal: 16,
  },
  crossfitBoxPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    width: 120,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossfitBoxPreviewCardDeleted: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e63946',
    borderStyle: 'dashed',
  },
  crossfitBoxPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossfitBoxPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#344E41',
    textAlign: 'center',
  },
  crossfitBoxPreviewNameDeleted: {
    color: '#999',
    fontStyle: 'italic',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletedIcon: {
    marginRight: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    borderRadius: 12,
    height: 48,
    width: '100%',
  },
});
