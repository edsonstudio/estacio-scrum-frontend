import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

export interface Classroom {
  id: string;
  name: string;
  description: string;
  subject: string;
  professorId: string;
  professorName: string;
  studentCount: number;
  createdAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-classrooms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    SidebarComponent
  ],
  templateUrl: './classrooms.component.html',
  styleUrls: ['./classrooms.component.scss']
})
export class ClassroomsComponent implements OnInit {
  classrooms: Classroom[] = [];
  displayedColumns: string[] = ['name', 'subject', 'professorName', 'studentCount', 'createdAt', 'actions'];
  isLoading = true;
  currentUser: User | null = null;
  isProfessor = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isProfessor = this.currentUser?.role === 'Professor';
    this.loadClassrooms();
  }

  loadClassrooms(): void {
    this.isLoading = true;
    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.classrooms = [];
      this.isLoading = false;
    }, 1000);
  }

  createClassroom(): void {
    this.router.navigate(['/classroom/new']);
  }

  joinClassroom(classroom: Classroom): void {
    // TODO: Implementar lógica de entrada na turma
    this.snackBar.open(`Entrando na turma ${classroom.name}...`, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  editClassroom(classroom: Classroom): void {
    this.router.navigate(['/classroom', classroom.id]);
  }

  deleteClassroom(classroom: Classroom): void {
    if (confirm(`Tem certeza que deseja excluir a turma "${classroom.name}"?`)) {
      // TODO: Implementar lógica de exclusão
      this.snackBar.open('Turma excluída com sucesso!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.loadClassrooms();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
