import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../../utils/axiosInstance';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface TimeSlot {
  id?: number;
  startTime: string;
  endTime: string;
  className: string;
  color?: string;
  displayOrder: number;
}

interface DaySchedule {
  id?: number;
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  timeSlots: TimeSlot[];
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'MONDAY', label: '월요일', short: '월' },
  { key: 'TUESDAY', label: '화요일', short: '화' },
  { key: 'WEDNESDAY', label: '수요일', short: '수' },
  { key: 'THURSDAY', label: '목요일', short: '목' },
  { key: 'FRIDAY', label: '금요일', short: '금' },
  { key: 'SATURDAY', label: '토요일', short: '토' },
  { key: 'SUNDAY', label: '일요일', short: '일' },
];

// 05:00 ~ 24:00 (38블록)
const TIME_SLOTS: string[] = [];
for (let hour = 5; hour < 24; hour++) {
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
}

const CELL_HEIGHT = 22;
const TIME_LABEL_WIDTH = 50;

// 색상 팔레트 (10개)
const COLOR_PALETTE = [
  '#588157', // 녹색
  '#3a86ff', // 파랑
  '#8338ec', // 보라
  '#ff006e', // 핑크
  '#fb5607', // 주황
  '#ffbe0b', // 노랑
  '#06d6a0', // 청록
  '#e63946', // 빨강
  '#457b9d', // 청회색
  '#6c757d', // 회색
];

const DEFAULT_COLOR = '#588157';

export default function ScheduleManagement() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 선택 상태
  const [selectStart, setSelectStart] = useState<{ day: DayOfWeek; time: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    className: string;
    color: string;
    isEdit: boolean;
    editIndex?: number;
    // 반복 설정
    repeatDays: DayOfWeek[];
    repeatTimes: string[]; // 추가 시작 시간들
  } | null>(null);

  // 다중 선택 모드
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set()); // "DAY-startTime" 형식

  useEffect(() => {
    fetchSchedule();
  }, []);

  // endTime이 없는 기존 데이터를 위해 기본 endTime 설정 (startTime + 1시간)
  const ensureEndTime = (slot: TimeSlot): TimeSlot => {
    if (slot.endTime) return slot;
    const startIndex = TIME_SLOTS.indexOf(slot.startTime);
    const endIndex = Math.min(startIndex + 2, TIME_SLOTS.length - 1);
    return { ...slot, endTime: TIME_SLOTS[endIndex] || '24:00' };
  };

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/schedule/my');
      if (response.data?.data?.schedules) {
        const schedulesWithEndTime = response.data.data.schedules.map((schedule: DaySchedule) => ({
          ...schedule,
          timeSlots: schedule.timeSlots.map(ensureEndTime),
        }));
        setSchedules(schedulesWithEndTime);
      }
    } catch (error) {
      console.error('시간표 조회 실패:', error);
      const emptySchedules: DaySchedule[] = DAYS.map((day) => ({
        dayOfWeek: day.key,
        isClosed: false,
        timeSlots: [],
      }));
      setSchedules(emptySchedules);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.put('/schedule/my', schedules);
      Alert.alert('성공', '시간표가 저장되었습니다.');
    } catch (error) {
      console.error('시간표 저장 실패:', error);
      Alert.alert('오류', '시간표 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const timeToIndex = (time: string): number => {
    return TIME_SLOTS.indexOf(time);
  };

  const getSlotAtTime = (dayOfWeek: DayOfWeek, time: string): { slot: TimeSlot; index: number } | null => {
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule) return null;

    const timeIndex = timeToIndex(time);
    for (let i = 0; i < schedule.timeSlots.length; i++) {
      const slot = schedule.timeSlots[i];
      const startIndex = timeToIndex(slot.startTime);
      const endIndex = timeToIndex(slot.endTime);
      if (timeIndex >= startIndex && timeIndex < endIndex) {
        return { slot, index: i };
      }
    }
    return null;
  };

  const handleCellPress = (day: DayOfWeek, time: string) => {
    const existingSlot = getSlotAtTime(day, time);

    if (existingSlot) {
      // 기존 일정 클릭 - 수정 모달
      setModalData({
        day,
        startTime: existingSlot.slot.startTime,
        endTime: existingSlot.slot.endTime,
        className: existingSlot.slot.className,
        color: existingSlot.slot.color || DEFAULT_COLOR,
        isEdit: true,
        editIndex: existingSlot.index,
        repeatDays: [day],
        repeatTimes: [],
      });
      setModalVisible(true);
      setSelectStart(null);
      return;
    }

    if (!selectStart) {
      // 첫 번째 클릭 - 시작점 선택
      setSelectStart({ day, time });
    } else if (selectStart.day === day) {
      // 같은 요일에서 두 번째 클릭 - 종료점
      const startIndex = timeToIndex(selectStart.time);
      const endIndex = timeToIndex(time);

      if (endIndex <= startIndex) {
        // 시작보다 이전이면 시작점 변경
        setSelectStart({ day, time });
        return;
      }

      // 종료 시간은 선택한 블럭의 다음 블럭
      const actualEndTime = TIME_SLOTS[endIndex + 1] || '24:00';

      // 겹치는 일정 확인
      const schedule = schedules.find((s) => s.dayOfWeek === day);
      if (schedule) {
        for (const slot of schedule.timeSlots) {
          const slotStart = timeToIndex(slot.startTime);
          const slotEnd = timeToIndex(slot.endTime);
          if (
            (startIndex >= slotStart && startIndex < slotEnd) ||
            (endIndex >= slotStart && endIndex < slotEnd) ||
            (startIndex <= slotStart && endIndex >= slotEnd)
          ) {
            Alert.alert('알림', '해당 시간에 이미 일정이 있습니다.');
            setSelectStart(null);
            return;
          }
        }
      }

      setModalData({
        day,
        startTime: selectStart.time,
        endTime: actualEndTime,
        className: '',
        color: DEFAULT_COLOR,
        isEdit: false,
        repeatDays: [day],
        repeatTimes: [],
      });
      setModalVisible(true);
      setSelectStart(null);
    } else {
      // 다른 요일 클릭 - 시작점 변경
      setSelectStart({ day, time });
    }
  };

  const toggleRepeatDay = (day: DayOfWeek) => {
    if (!modalData) return;
    setModalData((prev) => {
      if (!prev) return null;
      const isSelected = prev.repeatDays.includes(day);
      // 최소 1개는 선택되어 있어야 함
      if (isSelected && prev.repeatDays.length === 1) return prev;
      return {
        ...prev,
        repeatDays: isSelected
          ? prev.repeatDays.filter((d) => d !== day)
          : [...prev.repeatDays, day],
      };
    });
  };

  const toggleRepeatTime = (time: string) => {
    if (!modalData) return;
    setModalData((prev) => {
      if (!prev) return null;
      const isSelected = prev.repeatTimes.includes(time);
      return {
        ...prev,
        repeatTimes: isSelected
          ? prev.repeatTimes.filter((t) => t !== time)
          : [...prev.repeatTimes, time],
      };
    });
  };

  const calculateEndTimeForRepeat = (startTime: string): string => {
    if (!modalData) return startTime;
    const originalDuration = timeToIndex(modalData.endTime) - timeToIndex(modalData.startTime);
    const newStartIndex = timeToIndex(startTime);
    const newEndIndex = Math.min(newStartIndex + originalDuration, TIME_SLOTS.length - 1);
    return TIME_SLOTS[newEndIndex] || '24:00';
  };

  const handleModalSave = () => {
    if (!modalData || !modalData.className.trim()) {
      Alert.alert('알림', '수업명을 입력해주세요.');
      return;
    }

    // 모든 시작 시간 (원래 시간 + 반복 시간)
    const allStartTimes = [modalData.startTime, ...modalData.repeatTimes];

    setSchedules((prev) =>
      prev.map((s) => {
        // 반복 요일에 포함되지 않으면 스킵
        if (!modalData.repeatDays.includes(s.dayOfWeek)) {
          // 수정 모드이고 원래 요일인 경우 해당 슬롯 삭제
          if (modalData.isEdit && s.dayOfWeek === modalData.day && modalData.editIndex !== undefined) {
            return {
              ...s,
              timeSlots: s.timeSlots.filter((_, i) => i !== modalData.editIndex),
            };
          }
          return s;
        }

        let newTimeSlots = [...s.timeSlots];

        // 수정 모드이고 원래 요일인 경우 기존 슬롯 제거
        if (modalData.isEdit && s.dayOfWeek === modalData.day && modalData.editIndex !== undefined) {
          newTimeSlots = newTimeSlots.filter((_, i) => i !== modalData.editIndex);
        }

        // 각 시작 시간에 대해 슬롯 추가
        for (const startTime of allStartTimes) {
          const endTime = startTime === modalData.startTime
            ? modalData.endTime
            : calculateEndTimeForRepeat(startTime);

          // 겹치는 일정 제거
          const startIdx = timeToIndex(startTime);
          const endIdx = timeToIndex(endTime);
          newTimeSlots = newTimeSlots.filter((slot) => {
            const slotStart = timeToIndex(slot.startTime);
            const slotEnd = timeToIndex(slot.endTime);
            return !(
              (startIdx >= slotStart && startIdx < slotEnd) ||
              (endIdx > slotStart && endIdx <= slotEnd) ||
              (startIdx <= slotStart && endIdx >= slotEnd)
            );
          });

          newTimeSlots.push({
            startTime,
            endTime,
            className: modalData.className,
            color: modalData.color,
            displayOrder: newTimeSlots.length,
          });
        }

        // startTime 기준 정렬
        newTimeSlots.sort((a, b) => timeToIndex(a.startTime) - timeToIndex(b.startTime));

        return { ...s, timeSlots: newTimeSlots };
      })
    );

    setModalVisible(false);
    setModalData(null);
  };

  const handleClearAll = () => {
    Alert.alert(
      '전체 삭제',
      '모든 시간표를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전체 삭제',
          style: 'destructive',
          onPress: () => {
            setSchedules((prev) =>
              prev.map((s) => ({
                ...s,
                timeSlots: [],
              }))
            );
            Alert.alert('완료', '모든 시간표가 삭제되었습니다.');
          },
        },
      ]
    );
  };

  // 단일 일정 삭제 (모달에서)
  const handleModalDelete = () => {
    if (!modalData || !modalData.isEdit || modalData.editIndex === undefined) return;

    Alert.alert('삭제 확인', '이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setSchedules((prev) =>
            prev.map((s) => {
              if (s.dayOfWeek !== modalData.day) return s;
              return {
                ...s,
                timeSlots: s.timeSlots.filter((_, i) => i !== modalData.editIndex),
              };
            })
          );
          setModalVisible(false);
          setModalData(null);
        },
      },
    ]);
  };

  // 길게 눌러서 다중 선택 모드 시작
  const handleLongPress = (day: DayOfWeek, slot: TimeSlot) => {
    const key = `${day}-${slot.startTime}`;
    setIsMultiSelectMode(true);
    setSelectedSlots(new Set([key]));
  };

  // 다중 선택 모드에서 셀 선택/해제
  const toggleSlotSelection = (day: DayOfWeek, slot: TimeSlot) => {
    const key = `${day}-${slot.startTime}`;
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // 다중 선택 모드 취소
  const cancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedSlots(new Set());
  };

  // 선택된 일정 일괄 삭제
  const handleBatchDelete = () => {
    if (selectedSlots.size === 0) return;

    Alert.alert(
      '일괄 삭제',
      `선택한 ${selectedSlots.size}개의 일정을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setSchedules((prev) =>
              prev.map((s) => ({
                ...s,
                timeSlots: s.timeSlots.filter(
                  (slot) => !selectedSlots.has(`${s.dayOfWeek}-${slot.startTime}`)
                ),
              }))
            );
            cancelMultiSelect();
          },
        },
      ]
    );
  };

  const renderCell = (day: DayOfWeek, time: string, timeIndex: number) => {
    const slotInfo = getSlotAtTime(day, time);
    const isSelectStart = selectStart?.day === day && selectStart?.time === time;

    if (slotInfo) {
      const { slot } = slotInfo;
      const startIndex = timeToIndex(slot.startTime);
      const endIndex = timeToIndex(slot.endTime);
      const isFirstBlock = timeIndex === startIndex;
      const isLastBlock = timeIndex === endIndex - 1;
      const color = slot.color || DEFAULT_COLOR;
      const slotKey = `${day}-${slot.startTime}`;
      const isSlotSelected = selectedSlots.has(slotKey);

      return (
        <TouchableOpacity
          key={`${day}-${time}`}
          style={[
            styles.cell,
            styles.cellFilled,
            { backgroundColor: color },
            isFirstBlock && styles.cellFirstBlock,
            isLastBlock && styles.cellLastBlock,
            isSlotSelected && styles.cellMultiSelected,
          ]}
          onPress={() => {
            if (isMultiSelectMode) {
              toggleSlotSelection(day, slot);
            } else {
              handleCellPress(day, time);
            }
          }}
          onLongPress={() => handleLongPress(day, slot)}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          {isFirstBlock && (
            <Text style={styles.cellText} numberOfLines={1}>
              {slot.className}
            </Text>
          )}
          {isSlotSelected && isFirstBlock && (
            <View style={styles.cellCheckmark}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`${day}-${time}`}
        style={[
          styles.cell,
          styles.cellEmpty,
          isSelectStart && styles.cellSelected,
        ]}
        onPress={() => {
          if (isMultiSelectMode) {
            // 다중 선택 모드에서 빈 셀 클릭 시 무시
            return;
          }
          handleCellPress(day, time);
        }}
        activeOpacity={0.7}
      >
        {isSelectStart && (
          <View style={styles.cellSelectedIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시간표 관리</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 액션 바 */}
      <View style={styles.actionBar}>
        {isMultiSelectMode ? (
          <>
            <TouchableOpacity style={styles.cancelSelectButton} onPress={cancelMultiSelect}>
              <Ionicons name="close" size={18} color="#666" />
              <Text style={styles.cancelSelectText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.selectedCountText}>{selectedSlots.size}개 선택됨</Text>
            <TouchableOpacity
              style={[styles.batchDeleteButton, selectedSlots.size === 0 && styles.batchDeleteButtonDisabled]}
              onPress={handleBatchDelete}
              disabled={selectedSlots.size === 0}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.batchDeleteText}>삭제</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={16} color="#e63946" />
            <Text style={styles.clearButtonText}>전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 선택 힌트 */}
      {selectStart && (
        <View style={styles.selectionHint}>
          <View style={styles.selectionHintContent}>
            <Ionicons name="time-outline" size={16} color="#588157" />
            <Text style={styles.selectionHintText}>
              {DAYS.find(d => d.key === selectStart.day)?.label} {selectStart.time} 시작
            </Text>
            <Text style={styles.selectionHintSubText}>종료 시간을 선택하세요</Text>
          </View>
          <TouchableOpacity
            style={styles.selectionHintCancel}
            onPress={() => setSelectStart(null)}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* 요일 헤더 */}
        <View style={styles.dayHeaderRow}>
          <View style={styles.timeLabel} />
          {DAYS.map((day) => (
            <View key={day.key} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{day.short}</Text>
            </View>
          ))}
        </View>

        {/* 시간 그리드 */}
        {TIME_SLOTS.map((time, timeIndex) => (
          <View key={time} style={styles.timeRow}>
            <View style={styles.timeLabel}>
              <Text style={styles.timeLabelText}>
                {time.endsWith(':00') ? time : ''}
              </Text>
            </View>
            {DAYS.map((day) => renderCell(day.key, time, timeIndex))}
          </View>
        ))}
      </ScrollView>

      {/* 일정 설정 모달 (풀스크린) */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {/* 모달 헤더 */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setModalData(null);
              }}
            >
              <Ionicons name="close" size={28} color="#344E41" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {modalData?.isEdit ? '일정 수정' : '새 일정'}
            </Text>
            <TouchableOpacity onPress={handleModalSave}>
              <Text style={styles.modalSaveText}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* 수업명 입력 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>수업명</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="예: 스트렝스 + WOD"
                placeholderTextColor="#A3B18A"
                value={modalData?.className || ''}
                onChangeText={(text) =>
                  setModalData((prev) => (prev ? { ...prev, className: text } : null))
                }
              />
            </View>

            {/* 시간 표시 (고정) */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>시간</Text>
              <View style={styles.timeSelectRow}>
                <View style={styles.timeDisplayBox}>
                  <Text style={styles.timeSelectLabel}>시작</Text>
                  <Text style={styles.timeSelectValue}>{modalData?.startTime}</Text>
                </View>
                <Text style={styles.timeSelectDivider}>~</Text>
                <View style={styles.timeDisplayBox}>
                  <Text style={styles.timeSelectLabel}>종료</Text>
                  <Text style={styles.timeSelectValue}>{modalData?.endTime}</Text>
                </View>
              </View>
            </View>

            {/* 요일 반복 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>적용할 요일</Text>
              <Text style={styles.modalSectionHint}>여러 요일에 같은 일정을 추가합니다</Text>
              <View style={styles.daySelectRow}>
                {DAYS.map((day) => {
                  const isSelected = modalData?.repeatDays.includes(day.key);
                  return (
                    <TouchableOpacity
                      key={day.key}
                      style={[styles.daySelectButton, isSelected && styles.daySelectButtonActive]}
                      onPress={() => toggleRepeatDay(day.key)}
                    >
                      <Text
                        style={[
                          styles.daySelectText,
                          isSelected && styles.daySelectTextActive,
                        ]}
                      >
                        {day.short}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 시간 반복 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>추가 시간대</Text>
              <Text style={styles.modalSectionHint}>같은 수업을 다른 시간에도 추가합니다</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.repeatTimeRow}>
                  {TIME_SLOTS.map((time) => {
                    if (time === modalData?.startTime) return null;
                    const isSelected = modalData?.repeatTimes.includes(time);
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.repeatTimeButton,
                          isSelected && styles.repeatTimeButtonActive,
                        ]}
                        onPress={() => toggleRepeatTime(time)}
                      >
                        <Text
                          style={[
                            styles.repeatTimeText,
                            isSelected && styles.repeatTimeTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* 색상 선택 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>색상</Text>
              <View style={styles.colorSelectRow}>
                {COLOR_PALETTE.map((color) => {
                  const isSelected = modalData?.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSelectButton,
                        { backgroundColor: color },
                        isSelected && styles.colorSelectButtonActive,
                      ]}
                      onPress={() =>
                        setModalData((prev) => (prev ? { ...prev, color } : null))
                      }
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 삭제 버튼 (수정 모드에서만) */}
            {modalData?.isEdit && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleModalDelete}>
                <Ionicons name="trash-outline" size={20} color="#e63946" />
                <Text style={styles.deleteButtonText}>일정 삭제</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#588157',
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  saveButton: {
    backgroundColor: '#588157',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#e63946',
    fontWeight: '500',
  },
  cancelSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  cancelSelectText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCountText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
  },
  batchDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e63946',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  batchDeleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  batchDeleteText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  selectionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9',
  },
  selectionHintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
  },
  selectionHintSubText: {
    fontSize: 12,
    color: '#588157',
    marginLeft: 4,
  },
  selectionHintCancel: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
  },
  dayHeaderCell: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#344E41',
  },
  timeRow: {
    flexDirection: 'row',
  },
  timeLabel: {
    width: TIME_LABEL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    paddingRight: 6,
  },
  timeLabelText: {
    fontSize: 9,
    color: '#888',
    textAlign: 'right',
  },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellEmpty: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  cellFilled: {
    borderLeftWidth: 0,
  },
  cellSelected: {
    backgroundColor: '#e8f5e9',
  },
  cellSelectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#588157',
  },
  cellFirstBlock: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cellLastBlock: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cellMultiSelected: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cellCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  cellText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '500',
    paddingHorizontal: 1,
  },
  // 풀스크린 모달
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#588157',
  },
  modalScrollView: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 4,
  },
  modalSectionHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  modalTextInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#344E41',
  },
  timeSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeDisplayBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeSelectLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timeSelectValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  timeSelectDivider: {
    fontSize: 18,
    color: '#999',
    marginHorizontal: 12,
  },
  daySelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daySelectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectButtonActive: {
    backgroundColor: '#588157',
  },
  daySelectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  daySelectTextActive: {
    color: '#fff',
  },
  repeatTimeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  repeatTimeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  repeatTimeButtonActive: {
    backgroundColor: '#588157',
  },
  repeatTimeText: {
    fontSize: 13,
    color: '#666',
  },
  repeatTimeTextActive: {
    color: '#fff',
  },
  colorSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorSelectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelectButtonActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#e63946',
    fontWeight: '500',
  },
});
