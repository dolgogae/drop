import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '../../utils/axiosInstance';

interface CrossfitBoxResult {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: {
    addressLine1: string;
    addressLine2: string | null;
  } | null;
  latitude: number | null;
  longitude: number | null;
}

export default function SearchScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [crossfitBoxes, setCrossfitBoxes] = useState<CrossfitBoxResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const searchCrossfitBoxes = async () => {
      if (!debouncedKeyword.trim()) {
        setCrossfitBoxes([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await axiosInstance.get('/crossfit-boxes/search', {
          params: { keyword: debouncedKeyword },
        });
        setCrossfitBoxes(response.data.data || []);
      } catch (error) {
        console.error('크로스핏박스 검색 실패:', error);
        setCrossfitBoxes([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchCrossfitBoxes();
  }, [debouncedKeyword]);

  const clearSearch = () => {
    setKeyword('');
    setCrossfitBoxes([]);
    setHasSearched(false);
  };

  const handleCrossfitBoxPress = (crossfitBoxId: number) => {
    router.push(`/crossfit-box/${crossfitBoxId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Box 검색</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#A3B18A" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="예: 크로스핏 강남"
              placeholderTextColor="#A3B18A"
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#A3B18A" />
              </TouchableOpacity>
            )}
            {isLoading && (
              <ActivityIndicator size="small" color="#588157" style={styles.loadingIndicator} />
            )}
          </View>
        </View>

        {hasSearched && !isLoading && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              검색 결과 {crossfitBoxes.length > 0 ? `(${crossfitBoxes.length}개)` : ''}
            </Text>
            {crossfitBoxes.length === 0 ? (
              <View style={styles.emptyResult}>
                <Ionicons name="search-outline" size={48} color="#A3B18A" />
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              crossfitBoxes.map((crossfitBox) => (
                <TouchableOpacity
                  key={crossfitBox.id}
                  style={styles.crossfitBoxCard}
                  onPress={() => handleCrossfitBoxPress(crossfitBox.id)}
                >
                  <View style={styles.crossfitBoxInfo}>
                    <Text style={styles.crossfitBoxName}>{crossfitBox.name}</Text>
                    {crossfitBox.address && (
                      <Text style={styles.crossfitBoxAddress}>
                        {crossfitBox.address.addressLine1}
                        {crossfitBox.address.addressLine2 ? ` ${crossfitBox.address.addressLine2}` : ''}
                      </Text>
                    )}
                    {crossfitBox.phoneNumber && (
                      <Text style={styles.crossfitBoxPhone}>{crossfitBox.phoneNumber}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#344E41',
  },
  subtitle: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 6,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DAD7CD',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#344E41',
  },
  clearButton: {
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  resultSection: {
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 12,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 12,
  },
  crossfitBoxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  crossfitBoxInfo: {
    flex: 1,
  },
  crossfitBoxName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
  },
  crossfitBoxAddress: {
    fontSize: 14,
    color: '#588157',
    marginTop: 4,
  },
  crossfitBoxPhone: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 2,
  },
});
