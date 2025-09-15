export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  createdAt: string;
  lastLoginAt?: string;
  fullName: string;
}

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export enum UserRole {
  Admin = 1,
  User = 2,
  Guest = 3
}