import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
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
  address?: Address;
  latitude?: number;
  longitude?: number;
  usageInfoDto?: CrossfitBoxUsageInfo;
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

// 05:00 ~ 24:00 (38블록)
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

  useEffect(() => {
    if (id) {
      fetchCrossfitBoxDetail();
      fetchSchedule();
    }
  }, [id]);

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
        <Text style={styles.headerTitle}>크로스핏박스 정보</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 크로스핏박스 이름 */}
        <View style={styles.nameSection}>
          <Text style={styles.crossfitBoxName}>{crossfitBox.name}</Text>
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
        </View>

        {/* 이용 정보 */}
        {crossfitBox.usageInfoDto && (
          <View style={styles.usageCard}>
            <Text style={styles.sectionTitle}>편의시설</Text>
            <View style={styles.usageGrid}>
              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfoDto.parking && styles.usageIconActive]}>
                  <Ionicons
                    name="car-outline"
                    size={24}
                    color={crossfitBox.usageInfoDto.parking ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfoDto.parking && styles.usageLabelActive]}>
                  주차
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfoDto.wear && styles.usageIconActive]}>
                  <Ionicons
                    name="shirt-outline"
                    size={24}
                    color={crossfitBox.usageInfoDto.wear ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfoDto.wear && styles.usageLabelActive]}>
                  운동복
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, crossfitBox.usageInfoDto.locker && styles.usageIconActive]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={crossfitBox.usageInfoDto.locker ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, crossfitBox.usageInfoDto.locker && styles.usageLabelActive]}>
                  락커
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 시간표 (그리드 형식) */}
        {schedule && schedule.schedules && schedule.schedules.length > 0 && (
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

                {/* 시간 그리드 */}
                {TIME_SLOTS.map((time, timeIndex) => {
                  const timeToIndex = (t: string) => TIME_SLOTS.indexOf(t);

                  const getSlotAtTime = (dayOfWeek: string, t: string) => {
                    const daySchedule = schedule.schedules.find((s) => s.dayOfWeek === dayOfWeek);
                    if (!daySchedule || daySchedule.isClosed) return null;

                    const tIndex = timeToIndex(t);
                    for (const slot of daySchedule.timeSlots) {
                      const startIndex = timeToIndex(slot.startTime);
                      const endTime = slot.endTime || TIME_SLOTS[Math.min(startIndex + 2, TIME_SLOTS.length - 1)];
                      const endIndex = timeToIndex(endTime);
                      if (tIndex >= startIndex && tIndex < endIndex) {
                        return { slot, isFirst: tIndex === startIndex };
                      }
                    }
                    return null;
                  };

                  return (
                    <View key={time} style={styles.gridTimeRow}>
                      <View style={styles.gridTimeLabel}>
                        <Text style={styles.gridTimeLabelText}>{time}</Text>
                      </View>
                      {DAYS_ORDER.map((day) => {
                        const slotInfo = getSlotAtTime(day, time);

                        if (slotInfo) {
                          const { slot, isFirst } = slotInfo;
                          const color = slot.color || DEFAULT_COLOR;

                          return (
                            <View
                              key={`${day}-${time}`}
                              style={[
                                styles.gridCell,
                                { backgroundColor: color },
                                isFirst && styles.gridCellFirstBlock,
                              ]}
                            >
                              {isFirst && (
                                <Text style={styles.gridCellText} numberOfLines={1}>
                                  {slot.className}
                                </Text>
                              )}
                            </View>
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
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayScheduleRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayLabelContainer: {
    width: 36,
    marginRight: 12,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#344E41',
  },
  dayLabelClosed: {
    color: '#A3B18A',
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#588157',
    width: 50,
    marginRight: 8,
  },
  classNameText: {
    fontSize: 14,
    color: '#344E41',
    flex: 1,
  },
  closedText: {
    fontSize: 14,
    color: '#A3B18A',
    fontStyle: 'italic',
  },
  noClassText: {
    fontSize: 14,
    color: '#A3B18A',
  },
});
