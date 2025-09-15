import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, CreateUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('users');
  }

  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`users/${id}`);
  }

  createUser(user: CreateUser): Observable<User> {
    return this.apiService.post<User>('users', user);
  }

  updateUser(id: string, user: CreateUser): Observable<User> {
    return this.apiService.put<User>(`users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`users/${id}`);
  }
}