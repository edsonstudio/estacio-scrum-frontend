import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { professorGuard } from './core/guards/role.guard';
import { studentGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'live-class', 
    loadComponent: () => import('./features/live-class/live-class.component').then(m => m.LiveClassComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'upload-assignment', 
    loadComponent: () => import('./features/assignments/upload-assignment.component').then(m => m.UploadAssignmentComponent),
    canActivate: [studentGuard]
  },
  { 
    path: 'classrooms', 
    loadComponent: () => import('./features/classrooms/classrooms.component').then(m => m.ClassroomsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'classroom/:id', 
    loadComponent: () => import('./features/classroom/classroom.component').then(m => m.ClassroomComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'students', 
    loadComponent: () => import('./features/students/students.component').then(m => m.StudentsComponent),
    canActivate: [professorGuard]
  },
  { path: '**', redirectTo: '/login' }
];
