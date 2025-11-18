export type UploadMethod = 'package' | 'pill';

export interface OCRCandidate {
  id: string;
  name: string;
  confidence: number;
  ingredient: string;
}

export interface OCRResult {
  recognizedText: string;
  candidates: OCRCandidate[];
}

export interface ImagePickerResult {
  uri: string;
  width?: number;
  height?: number;
}
