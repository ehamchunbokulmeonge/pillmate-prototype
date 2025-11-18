import { OCRResult } from '@/types/ocr';

export class OCRService {
  /**
   * Mock OCR 결과 - 실제로는 서버 API 호출
   */
  static async recognizeText(imageUri: string): Promise<OCRResult> {
    // TODO: 실제 OCR API 호출 로직 구현
    // 현재는 Mock 데이터 반환
    
    // 실제 구현 시:
    // const formData = new FormData();
    // formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
    // const response = await fetch('YOUR_OCR_API_ENDPOINT', {
    //   method: 'POST',
    //   body: formData,
    // });
    // return await response.json();

    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      recognizedText: '타이레놀 500mg\n아세트아미노펜\n8시간 지속형',
      candidates: [
        { 
          id: '1', 
          name: '타이레놀 8시간 이알서방정', 
          confidence: 95, 
          ingredient: '아세트아미노펜' 
        },
        { 
          id: '2', 
          name: '타이레놀정 500mg', 
          confidence: 87, 
          ingredient: '아세트아미노펜' 
        },
        { 
          id: '3', 
          name: '타이레놀 콜드', 
          confidence: 72, 
          ingredient: '아세트아미노펜 외' 
        },
      ],
    };
  }

  /**
   * 약 상세 정보 조회
   */
  static async getMedicationDetails(medicationId: string): Promise<any> {
    // TODO: 실제 API 호출 로직 구현
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: medicationId,
      name: '타이레놀 8시간 이알서방정',
      ingredient: '아세트아미노펜',
      description: '해열, 진통제',
      // ... 기타 상세 정보
    };
  }
}
