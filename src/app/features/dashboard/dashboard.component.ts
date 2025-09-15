import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redireciona para login
        this.router.navigate(['/login']);
      }
    });
  }

  // Métodos para Professor
  startLiveClass(): void {
    // TODO: Implementar navegação para aula ao vivo
    console.log('Iniciando aula ao vivo...');
    this.router.navigate(['/live-class']);
  }

  viewStudents(): void {
    // TODO: Implementar visualização de alunos
    console.log('Visualizando alunos...');
    this.router.navigate(['/students']);
  }

  // Métodos para Aluno
  joinLiveClass(): void {
    // TODO: Implementar entrada na aula ao vivo
    console.log('Entrando na aula ao vivo...');
    this.router.navigate(['/live-class']);
  }

  uploadAssignment(): void {
    // TODO: Implementar upload de tarefa
    console.log('Enviando tarefa...');
    this.router.navigate(['/upload-assignment']);
  }
}