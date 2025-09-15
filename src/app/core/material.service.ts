import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Material {
  id: string;
  title: string;
  description: string;
  filePath: string;
  link?: string;
  createdAt: string;
  fileName: string;
}

export interface CreateMaterial {
  title: string;
  description: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private readonly API_URL = `${environment.apiUrl}/api/materials`;

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.API_URL);
  }

  getMaterial(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.API_URL}/${id}`);
  }

  uploadMaterial(materialData: CreateMaterial, file: File): Observable<Material> {
    const formData = new FormData();
    formData.append('title', materialData.title);
    formData.append('description', materialData.description);
    if (materialData.link) {
      formData.append('link', materialData.link);
    }
    formData.append('file', file);

    return this.http.post<Material>(`${this.API_URL}/upload`, formData);
  }

  updateMaterial(id: string, materialData: CreateMaterial): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, materialData);
  }

  deleteMaterial(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  downloadMaterial(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/download/${id}`, {
      responseType: 'blob'
    });
  }
}
