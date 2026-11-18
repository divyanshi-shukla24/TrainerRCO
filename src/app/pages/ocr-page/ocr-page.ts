import {
  Component, ElementRef, ViewChild,
  OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HomeStateService } from '../../services/home-state.service';
import { BoundingBoxService } from '../../services/bounding-box.service';
import { PageData, CutImage } from '../../models/page-data.interface';

@Component({
  selector: 'app-ocr-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ocr-page.html',
  styles: [`
    /* Custom inline styles */
  `]
})
export class OcrPage implements OnInit, OnDestroy {
  @ViewChild('topHalf')        topHalf!: ElementRef;
  @ViewChild('imageWrapper')   imageWrapper!: ElementRef<HTMLElement>;
  @ViewChild('originalImg')    originalImg!: ElementRef<HTMLImageElement>;
  @ViewChild('boundingCanvas') boundingCanvas!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);

  isSticky        = false;
  isLoading       = false;
  isCropMode      = false;
  activeCropCutId: number | null = null;
  isNavigating    = false;
  slideDirection: 'left' | 'right' | '' = '';
  isAddLineMode   = false;

  public approvedStatus: Record<number, boolean> = {};
  public ocrTextFields: Record<number, string> = {};
  public extraTextFields: Record<number, string> = {};

  zoomLevel       = 1;
  minZoom         = 0.5;
  maxZoom         = 3;
  zoomStep        = 0.1;
  private baseScaleToFit = 0;

  isPolygonMode   = false;
  polygonPoints: Array<{x: number; y: number}> = [];
  polygonCutId: number | null = null;

  private resizeHandler = () => this.syncCanvasToImage();

  get allImages(): any[]          { return this.state.allImages; }
  set allImages(v: any[])         { this.state.allImages = v; }
  get currentImageIndex(): number { return this.state.currentImageIndex; }
  set currentImageIndex(v: number){ this.state.currentImageIndex = v; }

  get pageData(): PageData | null               { return this.state.pageData; }
  set pageData(v: PageData | null)              { this.state.pageData = v; }
  get searchPerformed(): boolean                { return this.state.searchPerformed; }
  set searchPerformed(v: boolean)               { this.state.searchPerformed = v; }
  get searchTerm(): string                      { return this.state.searchTerm; }
  set searchTerm(v: string)                     { this.state.searchTerm = v; }
  get errorMessage(): string | null             { return this.state.errorMessage; }
  set errorMessage(v: string | null)            { this.state.errorMessage = v; }
  get lastSearchedAn(): string                  { return this.state.lastSearchedAn; }
  get cutImageActions(): Record<number, string> { return this.state.cutImageActions; }
  get cropBoxes()                               { return this.state.cropBoxes; }

  get canSubmit(): boolean {
    return this.pageData?.cutImages?.some((cut: CutImage) => {
      const action = this.cutImageActions[cut.id];
      return action === 'select' || action === 'polygon';
    }) ?? false;
  }

  get hasPrevImage(): boolean {
    return this.state.allImages.length > 1 && this.state.currentImageIndex > 0;
  }

  get hasNextImage(): boolean {
    return this.state.allImages.length > 1 &&
           this.state.currentImageIndex < this.state.allImages.length - 1;
  }

  constructor(
    private apiService: ApiService,
    private router:     Router,
    public  state:      HomeStateService,
    public  bbService:  BoundingBoxService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  onApprove(cutId?: number): void {
    if (cutId !== undefined) {
      this.approvedStatus[cutId] = true;
    }
  }

  onUnapprove(cutId?: number): void {
    if (cutId !== undefined) {
      this.approvedStatus[cutId] = false;
    }
  }

  private syncCanvasToImage(): void {
    const img     = this.originalImg?.nativeElement;
    const canvas  = this.boundingCanvas?.nativeElement;
    const wrapper = this.imageWrapper?.nativeElement;
    if (!img || !canvas || !wrapper) return;

    const w = img.clientWidth;
    const h = img.clientHeight;
    if (w === 0 || h === 0) return;

    canvas.width  = w;
    canvas.height = h;
    this.bbService.updateDimensions(wrapper, img, canvas);
  }

  onImageLoad(): void {
    requestAnimationFrame(() => {
      if (this.zoomLevel === 1 && this.imageWrapper) {
        this.imageWrapper.nativeElement.style.width  = '';
        this.imageWrapper.nativeElement.style.height = '';
      }
      this.syncCanvasToImage();
      this.cdr.detectChanges();
    });
  }

  onActionChange(cutId: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.state.cutImageActions[cutId] = value;

    if (value === 'polygon') {
      this.isPolygonMode = true;
      this.polygonCutId  = cutId;
    } else {
      this.isPolygonMode = false;
      this.polygonCutId  = null;
      this.bbService.clearCanvas(this.boundingCanvas?.nativeElement);
    }
  }

  onGo(an: string): void {
    if (!an?.trim()) { alert('Please enter an AN number'); return; }
    this.isLoading = true;
    this.state.lastSearchedAn = an;
    this.zoomLevel = 1;
    this.baseScaleToFit = 0;
    this.apiService.register(an).subscribe({
      next: (res: any) => {
        this.allImages = [...res.data.images].sort((a: any, b: any) => a.image_name.localeCompare(b.image_name));
        this.loadImageAtIndex(an, 0);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load data.';
        this.cdr.detectChanges();
      }
    });
  }

  loadImageAtIndex(an: string, index: number): void {
    if (index < 0 || index >= this.allImages.length) return;
    if (this.isNavigating) return;

    this.slideDirection    = index > this.currentImageIndex ? 'left' : 'right';
    this.isNavigating      = true;
    this.currentImageIndex = index;
    this.zoomLevel         = 1;
    this.baseScaleToFit    = 0;
    const selectedImage    = this.allImages[index];
    const imageId          = selectedImage.id;
    const fromCache        = selectedImage.status === 'completed';

    this.isLoading = !fromCache;
    this.cdr.detectChanges();

    const load$ = fromCache
      ? this.apiService.getImageDetails(imageId)
      : this.apiService.processLines(imageId);

    load$.subscribe({
      next: (res: any) => {
        const lines = res.data?.lines || [];
        const sortedLines = [...lines].sort((a: any, b: any) => a.line_number - b.line_number);

        this.pageData = {
          an,
          currentPage: index + 1,
          totalPages: this.allImages.length,
          originalImage: this.apiService.getImageUrl(selectedImage.image_path),
          cutImages: sortedLines.map((l: any) => ({
            id: l.id,
            lineNumber: l.line_number,
            imagePath: this.apiService.getLineImageUrl(l.id),
            x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2
          })),
          fullTranscription: '',
          imageId: selectedImage.id
        };

        this.isLoading    = false;
        this.isNavigating = false;
        setTimeout(() => { this.slideDirection = ''; this.cdr.detectChanges(); }, 350);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading      = false;
        this.isNavigating   = false;
        this.slideDirection = '';
        this.cdr.detectChanges();
      }
    });
  }

  goToPrevImage(): void {
    if (this.currentImageIndex > 0) {
      this.loadImageAtIndex(this.state.lastSearchedAn, this.currentImageIndex - 1);
    }
  }

  goToNextImage(): void {
    if (this.currentImageIndex < this.allImages.length - 1) {
      this.loadImageAtIndex(this.state.lastSearchedAn, this.currentImageIndex + 1);
    }
  }

  getPageNumbers(): number[] {
    const total   = this.allImages.length;
    const current = this.currentImageIndex + 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat(Math.min(this.zoomLevel + this.zoomStep, this.maxZoom).toFixed(1));
      this.applyZoomToImage();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat(Math.max(this.zoomLevel - this.zoomStep, this.minZoom).toFixed(1));
      this.applyZoomToImage();
    }
  }

  resetZoom(): void {
    this.zoomLevel      = 1;
    this.baseScaleToFit = 0;

    if (this.originalImg && this.imageWrapper && this.boundingCanvas) {
      const img     = this.originalImg.nativeElement;
      const wrapper = this.imageWrapper.nativeElement;
      const canvas  = this.boundingCanvas.nativeElement;
      img.style.width = img.style.height = img.style.maxWidth =
        img.style.maxHeight = img.style.transform = '';
      wrapper.style.width  = '';
      wrapper.style.height = '';
      canvas.style.transform = '';
    }

    requestAnimationFrame(() => {
      const img    = this.originalImg.nativeElement;
      const canvas = this.boundingCanvas.nativeElement;
      const wrapper = this.imageWrapper.nativeElement;

      const renderedW = img.clientWidth;
      const renderedH = img.clientHeight;

      if (renderedW > 0 && renderedH > 0) {
        canvas.width  = renderedW;
        canvas.height = renderedH;
      }
      this.bbService.updateDimensions(wrapper, img, canvas);
      this.cdr.detectChanges();
    });
  }

  applyZoomToImage(): void {
    if (!this.originalImg || !this.imageWrapper || !this.boundingCanvas) return;

    const img     = this.originalImg.nativeElement;
    const canvas  = this.boundingCanvas.nativeElement;
    const wrapper = this.imageWrapper.nativeElement;

    img.style.transform    = '';
    canvas.style.transform = '';

    if (this.zoomLevel === 1) {
      img.style.width     = '';
      img.style.height    = '';
      img.style.maxWidth  = '100%';
      img.style.maxHeight = 'calc(50vh - 140px)';
      wrapper.style.width  = '';
      wrapper.style.height = '';
      this.baseScaleToFit  = 0;
    } else {
      const naturalW   = img.naturalWidth;
      const naturalH   = img.naturalHeight;
      const container  = wrapper.parentElement!;
      const containerW = container.clientWidth - 80;
      const containerH = container.clientHeight;

      if (!this.baseScaleToFit) {
        this.baseScaleToFit = Math.min(containerW / naturalW, containerH / naturalH, 1);
      }

      const zoomedW = naturalW * this.baseScaleToFit * this.zoomLevel;
      const zoomedH = naturalH * this.baseScaleToFit * this.zoomLevel;

      img.style.width     = `${zoomedW}px`;
      img.style.height    = `${zoomedH}px`;
      img.style.maxWidth  = 'none';
      img.style.maxHeight = 'none';
      wrapper.style.width  = `${zoomedW}px`;
      wrapper.style.height = `${zoomedH}px`;

      canvas.width  = zoomedW;
      canvas.height = zoomedH;
    }

    requestAnimationFrame(() => {
      const renderedW = img.clientWidth;
      const renderedH = img.clientHeight;

      if (renderedW > 0 && renderedH > 0) {
        if (canvas.width !== renderedW || canvas.height !== renderedH) {
          canvas.width  = renderedW;
          canvas.height = renderedH;
        }
      }
      this.bbService.updateDimensions(wrapper, img, canvas);
      this.cdr.detectChanges();
    });
  }

  selectAll(): void {
    this.pageData?.cutImages?.forEach((cut: CutImage) => { this.state.cutImageActions[cut.id] = 'select'; });
  }

  deselectAll(): void {
    this.pageData?.cutImages?.forEach((cut: CutImage) => { this.state.cutImageActions[cut.id] = ''; });
  }

  deleteCutImage(cutId: number): void {
    if (this.pageData) {
      this.pageData.cutImages = this.pageData.cutImages.filter((c: CutImage) => c.id !== cutId);
      delete this.state.cutImageActions[cutId];
      delete this.approvedStatus[cutId];
      delete this.ocrTextFields[cutId];
      delete this.extraTextFields[cutId];
      this.cdr.detectChanges();
    }
  }

  submitOcr(): void {
    alert('OCR workflow submitted successfully!');
    this.router.navigate(['/select-project']);
  }

  goBackToSelect(): void {
    this.router.navigate(['/select-project']);
  }
}