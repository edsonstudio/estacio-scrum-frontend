export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: number;
  imageUrl?: string;
  category?: string;
  createdAt: string;
}

export interface CreateProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  status: number;
  imageUrl?: string;
  category?: string;
}

export enum ProductStatus {
  Active = 1,
  Inactive = 2,
  Discontinued = 3
}