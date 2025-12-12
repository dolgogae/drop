import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../utils/axiosInstance';

interface AddressValidationResult {
  valid: boolean;
  address: string;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string;
}

interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidAddress?: (result: AddressValidationResult) => void;
  placeholder?: string;
}

export default function AddressInput({
  value,
  onChangeText,
  onValidAddress,
  placeholder = '주소를 입력하세요',
}: AddressInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // 주소 검증 API 호출
  useEffect(() => {
    const validateAddress = async () => {
      if (!debouncedValue || debouncedValue.length < 2) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      try {
        const response = await axiosInstance.get('/api/address/validate', {
          params: { query: debouncedValue },
        });
        const result = response.data as AddressValidationResult;
        setValidationResult(result);

        if (result.valid && onValidAddress) {
          onValidAddress(result);
        }
      } catch (error) {
        console.error('주소 검증 실패:', error);
        setValidationResult({
          valid: false,
          address: debouncedValue,
          roadAddress: null,
          latitude: null,
          longitude: null,
          message: '주소 검증 중 오류가 발생했습니다.',
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateAddress();
  }, [debouncedValue, onValidAddress]);

  const getStatusIcon = () => {
    if (isValidating) {
      return <ActivityIndicator size="small" color="#588157" />;
    }
    if (!validationResult) {
      return null;
    }
    if (validationResult.valid) {
      return <Ionicons name="checkmark-circle" size={20} color="#588157" />;
    }
    return <Ionicons name="close-circle" size={20} color="#e63946" />;
  };

  const getStatusColor = () => {
    if (!validationResult) return '#ddd';
    return validationResult.valid ? '#588157' : '#e63946';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor: getStatusColor() }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A3B18A"
        />
        <View style={styles.iconContainer}>{getStatusIcon()}</View>
      </View>

      {validationResult && (
        <View style={styles.resultContainer}>
          {validationResult.valid ? (
            <>
              <Text style={styles.validText}>{validationResult.message}</Text>
              {validationResult.roadAddress && (
                <Text style={styles.addressText}>
                  도로명: {validationResult.roadAddress}
                </Text>
              )}
              <Text style={styles.addressText}>
                지번: {validationResult.address}
              </Text>
            </>
          ) : (
            <Text style={styles.invalidText}>{validationResult.message}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#344E41',
  },
  iconContainer: {
    paddingRight: 12,
    width: 32,
    alignItems: 'center',
  },
  resultContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  validText: {
    fontSize: 13,
    color: '#588157',
    fontWeight: '500',
  },
  invalidText: {
    fontSize: 13,
    color: '#e63946',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
