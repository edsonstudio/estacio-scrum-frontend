import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, CreateProduct } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) { }

  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products');
  }

  getActiveProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products/active');
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.apiService.get<Product[]>(`products/category/${category}`);
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`products/${id}`);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.apiService.post<Product>('products', product);
  }

  updateProduct(id: string, product: CreateProduct): Observable<Product> {
    return this.apiService.put<Product>(`products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`);
  }
}