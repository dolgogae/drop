import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { id, reviewId, rating: initRating, content: initContent } = useLocalSearchParams<{
    id: string;
    reviewId?: string;
    rating?: string;
    content?: string;
  }>();

  const isEdit = !!reviewId;
  const [rating, setRating] = useState<number>(initRating ? parseInt(initRating, 10) : 0);
  const [content, setContent] = useState(initContent || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await axiosInstance.patch(`/crossfit-boxes/${id}/reviews/${reviewId}`, { rating, content });
      } else {
        await axiosInstance.post(`/crossfit-boxes/${id}/reviews`, { rating, content });
      }
      router.back();
    } catch (err) {
      console.error('리뷰 저장 실패:', err);
      Alert.alert('오류', '리뷰 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '리뷰 수정' : '리뷰 작성'}</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 별점 선택 */}
          <View style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>별점</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating > 0 ? `${rating}점` : '탭하여 별점을 선택하세요'}
            </Text>
          </View>

          {/* 내용 입력 */}
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>내용</Text>
            <TextInput
              style={styles.textInput}
              placeholder="리뷰를 작성해주세요 (선택)"
              placeholderTextColor="#A3B18A"
              multiline
              maxLength={1000}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
        </ScrollView>

        {/* 제출 버튼 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.submitButton, (submitting || rating === 0) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
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
    alignSelf: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#A3B18A',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    minHeight: 150,
    fontSize: 15,
    color: '#344E41',
    lineHeight: 22,
    padding: 0,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 8,
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A3B18A',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
