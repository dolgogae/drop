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

interface GymResult {
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
  const [gyms, setGyms] = useState<GymResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const searchGyms = async () => {
      if (!debouncedKeyword.trim()) {
        setGyms([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await axiosInstance.get('/gyms/search', {
          params: { keyword: debouncedKeyword },
        });
        setGyms(response.data.data || []);
      } catch (error) {
        console.error('체육관 검색 실패:', error);
        setGyms([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchGyms();
  }, [debouncedKeyword]);

  const clearSearch = () => {
    setKeyword('');
    setGyms([]);
    setHasSearched(false);
  };

  const handleGymPress = (gymId: number) => {
    router.push(`/gym/${gymId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>체육관 검색</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#A3B18A" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="예: 클라이밍파크"
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
              검색 결과 {gyms.length > 0 ? `(${gyms.length}개)` : ''}
            </Text>
            {gyms.length === 0 ? (
              <View style={styles.emptyResult}>
                <Ionicons name="search-outline" size={48} color="#A3B18A" />
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              gyms.map((gym) => (
                <TouchableOpacity
                  key={gym.id}
                  style={styles.gymCard}
                  onPress={() => handleGymPress(gym.id)}
                >
                  <View style={styles.gymInfo}>
                    <Text style={styles.gymName}>{gym.name}</Text>
                    {gym.address && (
                      <Text style={styles.gymAddress}>
                        {gym.address.addressLine1}
                        {gym.address.addressLine2 ? ` ${gym.address.addressLine2}` : ''}
                      </Text>
                    )}
                    {gym.phoneNumber && (
                      <Text style={styles.gymPhone}>{gym.phoneNumber}</Text>
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
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
  },
  gymAddress: {
    fontSize: 14,
    color: '#588157',
    marginTop: 4,
  },
  gymPhone: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 2,
  },
});
