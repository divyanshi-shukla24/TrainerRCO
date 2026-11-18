import { Injectable } from '@angular/core';
import { PageData } from '../models/page-data.interface';

@Injectable({
  providedIn: 'root'
})
export class HomeStateService {
  allImages: any[] = [];
  currentImageIndex: number = 0;
  pageData: PageData | null = null;
  searchPerformed: boolean = false;
  searchTerm: string = '';
  errorMessage: string | null = null;
  lastSearchedAn: string = '';
  cutImageActions: Record<number, string> = {};
  cropBoxes: Record<number, any> = {};
  polygonBoxes: Record<number, any[]> = {};
}