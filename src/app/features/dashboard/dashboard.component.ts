import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  calendar_today_color = '#2563EB'; //Cor do calendario
  orange_color = '#FA8931';

  // Dados do Professor
  totalAlunos1: number = 0;
  aulasHoje1: number = 0;
  proximasAulas1: any[] = [];
  meusAlunos: any[] = [];
  materiaisDeAula1: any[] = [];

  // Dados do Aluno
  proximaAula: any = null;
  homeworkPendente: boolean = true;
  historicoAulas: any[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      // Se não há usuário logado, volta pro login
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (this.currentUser?.role === 'Professor') {
      this.loadProfessorData();
    } else if (this.currentUser?.role === 'Aluno') {
      this.loadStudentData();
    }
  }

  loadProfessorData(): void {
    // Mock data - substitua por chamadas API reais
    this.totalAlunos1 = 25;
    this.aulasHoje1 = 3;
    this.proximasAulas1 = [
      {
        id: 1,
        materia: 'Matemática Avançada',
        horario: '10:00 - 11:30',
        turma: 'Turma A',
        professor: 'Dr. João Silva',
        status: 'agendada'
      },
      {
        id: 2,
        materia: 'Física Quântica',
        horario: '14:00 - 15:30',
        turma: 'Turma B',
        professor: 'Dr. João Silva', 
        status: 'agendada'
      }
  ];
    this.meusAlunos = [
      {
        id: 1,
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        turma: 'Turma A',
        presenca: 95,
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      {
        id: 2,
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        turma: 'Turma A',
        presenca: 88,
        avatar: 'https://i.pravatar.cc/150?img=6'
      }
    ];
    this.materiaisDeAula1 = [
      {
        icone: 'description',
        nome: 'Present Simples - Exercises',
        tipo: 'PDF'

      },
      {
        icone: 'video_file',
        nome: 'Vocabulary: Daily Routines',
        tipo: 'Vídeo'
      },
      {
        icone: 'description',
        nome: 'Grammar Guide - Beginner',
        tipo: 'PDF'
      },
      {
        icone: 'audio_file',
        nome: 'Pronunciation Practice',
        tipo: 'Áudio'

      },
      {
        icone: 'description',
        nome: 'Present Simples - Exercises',
        tipo: 'PDF'

      },
      {
        icone: 'video_file',
        nome: 'Vocabulary: Daily Routines',
        tipo: 'Vídeo'
      },
      {
        icone: 'description',
        nome: 'Grammar Guide - Beginner',
        tipo: 'PDF'
      },
      {
        icone: 'audio_file',
        nome: 'Pronunciation Practice',
        tipo: 'Áudio'

      }
    ];
  }

  loadStudentData(): void {
    this.proximaAula = {
      nome: 'Inglês Básico',
      professor: 'Professor Silva',
      data: '15/01/2024',
      horario: '14:00'
    };

    this.homeworkPendente = true;

    this.historicoAulas = [
      { nome: 'Inglês Básico', data: '10/01/2024', homeworkStatus: 'Concluído' },
      { nome: 'Conversação', data: '05/01/2024', homeworkStatus: 'Concluído' },
      { nome: 'Grammar', data: '05/01/2024', homeworkStatus: 'Pendente' }
    ];
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  // Métodos adicionais (sem alteração)
  joinLiveClass(): void {
    console.log('Entrando na aula ao vivo...');
    this.router.navigate(['/live-class']);
  }

  uploadAssignment(): void {
    console.log('Enviando tarefa...');
    this.router.navigate(['/upload-assignment']);
  }

  fazerHomework(): void {
    console.log('Fazendo homework...');
  }

  startLiveClass(): void {
    console.log('Iniciando aula ao vivo...');
    this.router.navigate(['/live-class']);
  }

  viewStudents(): void {
    console.log('Visualizando alunos...');
    this.router.navigate(['/students']);
  }

  viewMaterials(): void {
    console.log('Visualizando materiais...');
  }
}
