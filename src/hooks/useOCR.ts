import { useState } from 'react';
import { OCRService } from '@/services/ocrService';
import { OCRResult } from '@/types/ocr';

export function useOCR() {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 이미지에서 텍스트 인식
   */
  const recognizeImage = async (imageUri: string): Promise<OCRResult | null> => {
    setIsRecognizing(true);
    setError(null);

    try {
      const result = await OCRService.recognizeText(imageUri);
      setOcrResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '텍스트 인식에 실패했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsRecognizing(false);
    }
  };

  /**
   * OCR 결과 초기화
   */
  const resetOCR = () => {
    setOcrResult(null);
    setError(null);
  };

  return {
    ocrResult,
    isRecognizing,
    error,
    recognizeImage,
    resetOCR,
  };
}
