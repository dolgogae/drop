import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';

interface CrossfitBoxUsageInfo {
  parking: boolean;
  wear: boolean;
  locker: boolean;
}

interface Address {
  addressLine1: string;
  addressLine2?: string;
  zipCode?: string;
}

interface CrossfitBoxDetail {
  id: number;
  name: string;
  phoneNumber?: string;
  etcInfo?: string;
  dropInFee?: number;
  address?: Address;
  latitude?: number;
  longitude?: number;
  usageInfo?: CrossfitBoxUsageInfo;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime?: string;
  className: string;
  color?: string;
  displayOrder: number;
}

interface DaySchedule {
  id: number;
  dayOfWeek: string;
  isClosed: boolean;
  timeSlots: TimeSlot[];
}

interface ScheduleData {
  crossfitBoxId: number;
  schedules: DaySchedule[];
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const TIME_SLOTS: string[] = [];
for (let hour = 5; hour < 24; hour++) {
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
}

const CELL_HEIGHT = 20;
const TIME_LABEL_WIDTH = 45;
const DEFAULT_COLOR = '#588157';

export default function CrossfitBoxDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [crossfitBox, setCrossfitBox] = useState<CrossfitBoxDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingHomeBox, setIsSettingHomeBox] = useState(false);
  const [currentHomeBoxId, setCurrentHomeBoxId] = useState<number | null>(null);

  // 토스트 상태
  const [toast, setToast] = useState<{ visible: boolean; message: string; time: string; color: string; x: number; y: number }>({
    visible: false,
    message: '',
    time: '',
    color: DEFAULT_COLOR,
    x: 0,
    y: 0,
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (className: string, startTime: string, endTime: string, color: string, pageX: number, pageY: number) => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({
      visible: true,
      message: className,
      time: `${startTime} ~ ${endTime}`,
      color,
      x: pageX,
      y: pageY + 10,
    });

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    toastTimeout.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      });
    }, 2000);
  };

  useEffect(() => {
    if (id) {
      fetchCrossfitBoxDetail();
      fetchSchedule();
      fetchCurrentHomeBox();
    }
  }, [id]);

  const fetchCurrentHomeBox = async () => {
    try {
      const response = await axiosInstance.get('/mypage/home-box');
      setCurrentHomeBoxId(response.data?.data ?? null);
    } catch (err) {
      console.error('My Box 조회 실패:', err);
    }
  };

  const fetchCrossfitBoxDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/crossfit-boxes/${id}`);
      if (response.data?.data) {
        setCrossfitBox(response.data.data);
      }
    } catch (err: any) {
      console.error('크로스핏박스 상세 조회 실패:', err);
      setError('Box 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axiosInstance.get(`/crossfit-boxes/${id}/schedule`);
      if (response.data?.data) {
        setSchedule(response.data.data);
      }
    } catch (err: any) {
      console.error('시간표 조회 실패:', err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCall = async () => {
    if (crossfitBox?.phoneNumber) {
      const phoneUrl = `tel:${crossfitBox.phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('전화 연결', `전화번호: ${crossfitBox.phoneNumber}`, [{ text: '확인' }]);
      }
    }
  };

  const handleOpenMap = async () => {
    const address = getFullAddress();
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      const naverMapAppUrl = `nmap://search?query=${encodedAddress}&appname=com.drop.app`;
      const naverMapWebUrl = `https://map.naver.com/v5/search/${encodedAddress}`;

      const canOpenNaverMap = await Linking.canOpenURL(naverMapAppUrl);
      if (canOpenNaverMap) {
        Linking.openURL(naverMapAppUrl);
      } else {
        Linking.openURL(naverMapWebUrl);
      }
    }
  };

  const isCurrentHomeBox = crossfitBox?.id === currentHomeBoxId;

  const handleToggleHomeBox = async () => {
    if (!crossfitBox) return;

    setIsSettingHomeBox(true);
    try {
      if (isCurrentHomeBox) {
        await axiosInstance.delete('/mypage/home-box');
        setCurrentHomeBoxId(null);
        Alert.alert('My Box 해제', `${crossfitBox.name}이(가) My Box에서 해제되었습니다.`);
      } else {
        await axiosInstance.patch(`/mypage/home-box/${crossfitBox.id}`);
        setCurrentHomeBoxId(crossfitBox.id);
        Alert.alert('My Box 설정', `${crossfitBox.name}이(가) My Box로 설정되었습니다.`);
      }
    } catch (err: any) {
      console.error('My Box 변경 실패:', err);
      Alert.alert('오류', 'My Box 변경에 실패했습니다.');
    } finally {
      setIsSettingHomeBox(false);
    }
  };

  const getFullAddress = () => {
    if (!crossfitBox?.address) return null;
    const { addressLine1, addressLine2 } = crossfitBox.address;
    if (addressLine2) {
      return `${addressLine1} ${addressLine2}`;
    }
    return addressLine1;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#344E41" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Box 정보</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !crossfitBox) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#344E41" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Box 정보</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#A3B18A" />
          <Text style={styles.errorText}>{error || 'Box를 찾을 수 없습니다.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCrossfitBoxDetail}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullAddress = getFullAddress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Box 정보</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 크로스핏박스 이름 */}
        <View style={styles.nameSection}>
          <Text style={styles.crossfitBoxName}>{crossfitBox.name}</Text>
          <TouchableOpacity
            style={[styles.homeBoxButton, isCurrentHomeBox && styles.homeBoxButtonActive]}
            onPress={handleToggleHomeBox}
            disabled={isSettingHomeBox}
          >
            {isSettingHomeBox ? (
              <ActivityIndicator size="small" color={isCurrentHomeBox ? '#fff' : '#588157'} />
            ) : (
              <>
                <Ionicons
                  name={isCurrentHomeBox ? 'home' : 'home-outline'}
                  size={18}
                  color={isCurrentHomeBox ? '#fff' : '#588157'}
                />
                <Text style={[styles.homeBoxButtonText, isCurrentHomeBox && styles.homeBoxButtonTextActive]}>
                  {isCurrentHomeBox ? 'My Box 해제' : 'My Box로 설정'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 기본 정보 */}
        <View style={styles.infoCard}>
          {/* 주소 */}
          {fullAddress && (
            <TouchableOpacity style={styles.infoRow} onPress={handleOpenMap}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>주소</Text>
                <Text style={styles.infoValue}>{fullAddress}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
            </TouchableOpacity>
          )}

          {/* 전화번호 */}
          {crossfitBox.phoneNumber && (
            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>전화번호</Text>
                <Text style={styles.infoValue}>{crossfitBox.phoneNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
            </TouchableOpacity>
          )}

          {/* 기타 정보 */}
          {crossfitBox.etcInfo && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>추가 정보</Text>
                <Text style={styles.infoValue}>{crossfitBox.etcInfo}</Text>
              </View>
            </View>
          )}

          {/* 드랍인 비용 */}
          {crossfitBox.dropInFee && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="cash-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>드랍인 비용</Text>
                <Text style={styles.infoValue}>{crossfitBox.dropInFee.toLocaleString()}원</Text>
              </View>
            </View>
          )}
        </View>

        {/* 이용 정보 */}
        {crossfitBox.usageInfo && (
          <View style={styles.usageCard}>
            <Text style={styles.sectionTitle}>편의시설</Text>
            <View style={styles.usageGrid}>
              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfo.parking && styles.usageIconActive]}>
                  <Ionicons
                    name="car-outline"
                    size={24}
                    color={crossfitBox.usageInfo.parking ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfo.parking && styles.usageLabelActive]}>
                  주차
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfo.wear && styles.usageIconActive]}>
                  <Ionicons
                    name="shirt-outline"
                    size={24}
                    color={crossfitBox.usageInfo.wear ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfo.wear && styles.usageLabelActive]}>
                  운동복
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfo.locker && styles.usageIconActive]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={crossfitBox.usageInfo.locker ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfo.locker && styles.usageLabelActive]}>
                  락커
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 시간표 (그리드 형식) */}
        {schedule && schedule.schedules && schedule.schedules.length > 0 && (() => {
          const timeToIndex = (t: string) => TIME_SLOTS.indexOf(t);

          const usedTimeIndices = new Set<number>();
          schedule.schedules.forEach((daySchedule) => {
            if (daySchedule.isClosed) return;
            daySchedule.timeSlots.forEach((slot) => {
              const startIndex = timeToIndex(slot.startTime);
              const endTime = slot.endTime || TIME_SLOTS[Math.min(startIndex + 2, TIME_SLOTS.length - 1)];
              const endIndex = timeToIndex(endTime);
              for (let i = startIndex; i < endIndex; i++) {
                usedTimeIndices.add(i);
              }
            });
          });

          if (usedTimeIndices.size === 0) return null;

          const sortedIndices = Array.from(usedTimeIndices).sort((a, b) => a - b);

          const timeGroups: { indices: number[]; startTime: string; endTime: string }[] = [];
          let currentGroup: number[] = [];

          sortedIndices.forEach((idx, i) => {
            if (currentGroup.length === 0) {
              currentGroup.push(idx);
            } else {
              const lastIdx = currentGroup[currentGroup.length - 1];
              if (idx === lastIdx + 1) {
                currentGroup.push(idx);
              } else {
                // 그룹 종료
                timeGroups.push({
                  indices: [...currentGroup],
                  startTime: TIME_SLOTS[currentGroup[0]],
                  endTime: TIME_SLOTS[currentGroup[currentGroup.length - 1] + 1] || '24:00',
                });
                currentGroup = [idx];
              }
            }
          });
          if (currentGroup.length > 0) {
            timeGroups.push({
              indices: [...currentGroup],
              startTime: TIME_SLOTS[currentGroup[0]],
              endTime: TIME_SLOTS[currentGroup[currentGroup.length - 1] + 1] || '24:00',
            });
          }

          const getSlotAtTime = (dayOfWeek: string, t: string) => {
            const daySchedule = schedule.schedules.find((s) => s.dayOfWeek === dayOfWeek);
            if (!daySchedule || daySchedule.isClosed) return null;

            const tIndex = timeToIndex(t);
            for (const slot of daySchedule.timeSlots) {
              const startIndex = timeToIndex(slot.startTime);
              const endTime = slot.endTime || TIME_SLOTS[Math.min(startIndex + 2, TIME_SLOTS.length - 1)];
              const endIndex = timeToIndex(endTime);
              if (tIndex >= startIndex && tIndex < endIndex) {
                return { slot, isFirst: tIndex === startIndex, isLast: tIndex === endIndex - 1, endTime };
              }
            }
            return null;
          };

          const isStartTime = (t: string) => {
            return schedule.schedules.some((daySchedule) => {
              if (daySchedule.isClosed) return false;
              return daySchedule.timeSlots.some((slot) => slot.startTime === t);
            });
          };

          return (
            <View style={styles.scheduleCard}>
              <Text style={styles.sectionTitle}>시간표</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* 요일 헤더 */}
                  <View style={styles.gridHeaderRow}>
                    <View style={styles.gridTimeLabel} />
                    {DAYS_ORDER.map((day) => (
                      <View key={day} style={styles.gridDayHeaderCell}>
                        <Text style={styles.gridDayHeaderText}>{DAY_LABELS[day]}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 시간 그리드 (그룹별로 렌더링) */}
                  {timeGroups.map((group, groupIndex) => (
                    <React.Fragment key={`group-${groupIndex}`}>
                      {/* 구분선 (첫 번째 그룹이 아닌 경우) */}
                      {groupIndex > 0 && (
                        <View style={styles.gridDividerRow}>
                          <View style={styles.gridTimeLabel}>
                            <Text style={styles.gridDividerText}>⋮</Text>
                          </View>
                          {DAYS_ORDER.map((day) => (
                            <View key={`divider-${day}`} style={styles.gridDividerCell}>
                              <View style={styles.gridDividerLine} />
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 해당 그룹의 시간 슬롯들 */}
                      {group.indices.map((timeIndex) => {
                        const time = TIME_SLOTS[timeIndex];
                        return (
                          <View key={time} style={styles.gridTimeRow}>
                            <View style={styles.gridTimeLabel}>
                              <Text style={styles.gridTimeLabelText}>
                                {isStartTime(time) ? time : ''}
                              </Text>
                            </View>
                            {DAYS_ORDER.map((day) => {
                              const slotInfo = getSlotAtTime(day, time);

                              if (slotInfo) {
                                const { slot, isFirst, isLast, endTime } = slotInfo;
                                const color = slot.color || DEFAULT_COLOR;

                                return (
                                  <TouchableOpacity
                                    key={`${day}-${time}`}
                                    style={[
                                      styles.gridCell,
                                      styles.gridCellFilled,
                                      { backgroundColor: color },
                                      isFirst && styles.gridCellFirstBlock,
                                      isLast && styles.gridCellLastBlock,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={(e) => {
                                      const { pageX, pageY } = e.nativeEvent;
                                      showToast(slot.className, slot.startTime, endTime, color, pageX, pageY);
                                    }}
                                  >
                                    {isFirst && (
                                      <Text style={styles.gridCellText} numberOfLines={1}>
                                        {slot.className}
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                );
                              }

                              return (
                                <View
                                  key={`${day}-${time}`}
                                  style={[styles.gridCell, styles.gridCellEmpty]}
                                />
                              );
                            })}
                          </View>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        })()}
      </ScrollView>

      {/* 토스트 */}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              top: toast.y,
              left: Math.max(16, Math.min(toast.x - 100, 200)),
            },
          ]}
        >
          <View style={[styles.toastColorBar, { backgroundColor: toast.color }]} />
          <View style={styles.toastContent}>
            <Text style={styles.toastMessage}>{toast.message}</Text>
            <Text style={styles.toastTime}>{toast.time}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#A3B18A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#588157',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  nameSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  crossfitBoxName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    textAlign: 'center',
  },
  homeBoxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#588157',
    backgroundColor: '#f0f7f0',
  },
  homeBoxButtonActive: {
    backgroundColor: '#588157',
    borderColor: '#588157',
  },
  homeBoxButtonText: {
    fontSize: 14,
    color: '#588157',
    fontWeight: '600',
    marginLeft: 6,
  },
  homeBoxButtonTextActive: {
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#A3B18A',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#344E41',
    fontWeight: '500',
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 16,
  },
  usageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageItem: {
    alignItems: 'center',
  },
  usageIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageIconActive: {
    backgroundColor: '#588157',
  },
  usageLabel: {
    fontSize: 13,
    color: '#A3B18A',
  },
  usageLabelActive: {
    color: '#344E41',
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
  },
  gridDayHeaderCell: {
    width: 38,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDayHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#344E41',
  },
  gridTimeRow: {
    flexDirection: 'row',
  },
  gridTimeLabel: {
    width: TIME_LABEL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    paddingRight: 4,
  },
  gridTimeLabelText: {
    fontSize: 8,
    color: '#888',
    textAlign: 'right',
  },
  gridCell: {
    width: 38,
    height: CELL_HEIGHT,
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCellEmpty: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  gridCellFilled: {
    borderLeftWidth: 0,
  },
  gridCellFirstBlock: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  gridCellLastBlock: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  gridCellText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '500',
    paddingHorizontal: 1,
  },
  gridDividerRow: {
    flexDirection: 'row',
    height: 16,
    backgroundColor: '#fafafa',
  },
  gridDividerText: {
    fontSize: 10,
    color: '#bbb',
    textAlign: 'right',
    paddingRight: 4,
  },
  gridDividerCell: {
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDividerLine: {
    width: '60%',
    height: 1,
    backgroundColor: '#ddd',
  },
  toast: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  toastColorBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  toastContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toastMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 2,
  },
  toastTime: {
    fontSize: 12,
    color: '#588157',
  },
});
