import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { updateProfile, RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ProfileImageScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const profile = useSelector((state: RootState) => state.user.profile);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('mypage.permissionRequired'), t('mypage.photoLibraryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await axiosInstance.post('/mypage/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(updateProfile({ profileImage: response.data.data }));
      Alert.alert(t('mypage.updateSuccess'));
    } catch (error: any) {
      const message = error.response?.data?.message || t('validation.error');
      Alert.alert(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async () => {
    Alert.alert(
      t('mypage.deleteProfileImage'),
      t('mypage.deleteImageConfirm'),
      [
        { text: t('mypage.cancel'), style: 'cancel' },
        {
          text: t('mypage.delete'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axiosInstance.delete('/mypage/profile-image');
              dispatch(updateProfile({ profileImage: null }));
              Alert.alert(t('mypage.updateSuccess'));
            } catch (error: any) {
              const message = error.response?.data?.message || t('validation.error');
              Alert.alert(message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#588157" />
            </View>
          ) : profile?.profileImage ? (
            <Image
              source={{ uri: `${API_BASE_URL}/image/${profile.profileImage}` }}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={60} color="#A3B18A" />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.changeButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text style={styles.changeButtonText}>{t('mypage.changeProfileImage')}</Text>
        </TouchableOpacity>

        {profile?.profileImage && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteImage}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>{t('mypage.deleteProfileImage')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  imageContainer: {
    marginBottom: 40,
  },
  loadingContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  profileImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588157',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
