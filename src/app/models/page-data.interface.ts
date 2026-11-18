export interface CutImage {
  id: number;
  lineNumber: number;
  imagePath: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PageData {
  an: string;
  currentPage: number;
  totalPages: number;
  originalImage: string;
  cutImages: CutImage[];
  fullTranscription?: string;
  imageId?: number;
}