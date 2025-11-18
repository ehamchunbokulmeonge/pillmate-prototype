import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useOCR } from '@/hooks/useOCR';
import { UploadMethod } from '@/types/ocr';

export default function AddMedicationScreen() {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod | null>(null);
  const { selectedImage, isLoading: imageLoading, takePhoto, pickImage, resetImage } = useImagePicker();
  const { ocrResult, isRecognizing, recognizeImage, resetOCR } = useOCR();

  // 이미지가 선택되면 자동으로 OCR 실행
  useEffect(() => {
    if (selectedImage) {
      recognizeImage(selectedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  // 카메라로 촬영
  const handleTakePhoto = async () => {
    await takePhoto();
  };

  // 갤러리에서 선택
  const handlePickImage = async () => {
    await pickImage();
  };

  // 다시 촬영
  const handleReset = () => {
    resetImage();
    resetOCR();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introText}>
            포장지나 낱알 사진을 업로드하여 약을 쉽게 등록하세요
          </Text>
        </View>

        {/* Upload Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>업로드 방식 선택</Text>
          <View style={styles.methodContainer}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                uploadMethod === 'package' && styles.methodCardActive,
              ]}
              onPress={() => setUploadMethod('package')}
            >
              <MaterialIcons 
                name="inventory-2" 
                size={40} 
                color={uploadMethod === 'package' ? Colors.primary : Colors.gray400} 
                style={styles.methodIcon}
              />
              <Text style={styles.methodTitle}>포장지 사진</Text>
              <Text style={styles.methodDescription}>약 포장지를 촬영하거나{'\n'}갤러리에서 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                uploadMethod === 'pill' && styles.methodCardActive,
              ]}
              onPress={() => setUploadMethod('pill')}
            >
              <MaterialIcons 
                name="medication" 
                size={40} 
                color={uploadMethod === 'pill' ? Colors.primary : Colors.gray400}
                style={styles.methodIcon}
              />
              <Text style={styles.methodTitle}>낱알 사진</Text>
              <Text style={styles.methodDescription}>약 알약을 촬영하거나{'\n'}갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Area */}
        {uploadMethod && (
          <View style={styles.section}>
            <Card style={styles.uploadArea}>
              {selectedImage ? (
                <>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <Text style={styles.uploadTitle}>사진이 업로드되었습니다</Text>
                  <Button
                    title="다시 촬영"
                    onPress={handleReset}
                    variant="outline"
                  />
                </>
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={60} color={Colors.gray400} style={styles.uploadIcon} />
                  <Text style={styles.uploadTitle}>사진을 업로드하세요</Text>
                  <View style={styles.uploadButtons}>
                    <Button
                      title="카메라로 촬영"
                      onPress={handleTakePhoto}
                      variant="primary"
                    />
                    <Button 
                      title="갤러리에서 선택" 
                      onPress={handlePickImage} 
                      variant="outline" 
                    />
                  </View>
                </>
              )}
            </Card>
          </View>
        )}

        {/* OCR Recognition Results */}
        {ocrResult && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>인식 결과</Text>
              <Card style={styles.recognitionCard}>
                <Text style={styles.recognitionTitle}>인식된 텍스트</Text>
                <Text style={styles.recognizedText}>{ocrResult.recognizedText}</Text>
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>약 후보 목록</Text>
              <Text style={styles.candidatesSubtitle}>
                인식된 약을 선택하여 상세정보를 확인하세요
              </Text>
              {ocrResult.candidates.map((candidate) => (
                <TouchableOpacity key={candidate.id}>
                  <Card style={styles.candidateCard}>
                    <View style={styles.candidateHeader}>
                      <View style={styles.candidateInfo}>
                        <Text style={styles.candidateName}>{candidate.name}</Text>
                        <Text style={styles.candidateIngredient}>{candidate.ingredient}</Text>
                      </View>
                      <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>{candidate.confidence}%</Text>
                      </View>
                    </View>
                    <View style={styles.candidateFooter}>
                      <Text style={styles.viewDetailsText}>상세정보 보기 →</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    marginBottom: 32,
  },
  introText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  methodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  methodIcon: {
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  uploadButtons: {
    width: '100%',
    gap: 12,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  recognitionCard: {
    backgroundColor: Colors.gray50,
  },
  recognitionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  recognizedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  candidatesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  candidateCard: {
    marginBottom: 12,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  candidateIngredient: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  confidenceBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  candidateFooter: {
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
