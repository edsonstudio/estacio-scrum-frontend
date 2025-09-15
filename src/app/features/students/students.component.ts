import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, User } from '../../core/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-students',
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
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  displayedColumns: string[] = ['fullName', 'email', 'createdAt', 'lastLoginAt', 'isActive', 'actions'];
  isLoading = true;
  currentUser: User | null = null;

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.students = [];
      this.isLoading = false;
    }, 1000);
  }

  toggleStudentStatus(student: Student): void {
    const action = student.isActive ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} o aluno "${student.fullName}"?`)) {
      // TODO: Implementar lógica de ativação/desativação
      student.isActive = !student.isActive;
      this.snackBar.open(`Aluno ${action}do com sucesso!`, 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  viewStudentDetails(student: Student): void {
    // TODO: Implementar visualização de detalhes do aluno
    this.snackBar.open(`Visualizando detalhes de ${student.fullName}...`, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatLastLogin(dateString?: string): string {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
