import { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { ImageService } from '@/services/imageService';
import { ImagePickerResult } from '@/types/ocr';

export function useImagePicker() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  /**
   * 카메라로 사진 촬영
   */
  const takePhoto = async (): Promise<ImagePickerResult | null> => {
    setIsLoading(true);
    
    try {
      // 권한 확인
      if (!permission) {
        return null;
      }

      if (!permission.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
          return null;
        }
      }

      // 사진 촬영
      const result = await ImageService.takePhoto();
      
      if (result) {
        setSelectedImage(result.uri);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 갤러리에서 이미지 선택
   */
  const pickImage = async (): Promise<ImagePickerResult | null> => {
    setIsLoading(true);
    
    try {
      const result = await ImageService.pickImage();
      
      if (result) {
        setSelectedImage(result.uri);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 선택된 이미지 초기화
   */
  const resetImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    isLoading,
    takePhoto,
    pickImage,
    resetImage,
    permission,
  };
}
