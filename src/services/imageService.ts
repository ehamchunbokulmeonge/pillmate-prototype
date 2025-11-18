import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { ImagePickerResult } from '@/types/ocr';

export class ImageService {
  /**
   * 카메라로 사진 촬영
   */
  static async takePhoto(): Promise<ImagePickerResult | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
      return null;
    }
  }

  /**
   * 갤러리에서 이미지 선택
   */
  static async pickImage(): Promise<ImagePickerResult | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
      return null;
    }
  }

  /**
   * 카메라 권한 요청
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }
}
