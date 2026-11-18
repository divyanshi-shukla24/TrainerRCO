import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  register(an: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, { an });
  }

  getImageDetails(imageId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/image/${imageId}`);
  }

  processLines(imageId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/process-lines`, { imageId });
  }

  getImageUrl(path: string): string {
    return `${this.baseUrl}/images/${path}`;
  }

  getLineImageUrl(lineId: number): string {
    return `${this.baseUrl}/line-image/${lineId}`;
  }
}