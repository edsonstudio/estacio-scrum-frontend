import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from '../../core/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

export interface ClassroomMessage {
  id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
}

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss']
})
export class ClassroomComponent implements OnInit {
  classroomId: string | null = null;
  currentUser: User | null = null;
  isProfessor = false;
  messages: ClassroomMessage[] = [];
  newMessage = '';
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.classroomId = this.route.snapshot.paramMap.get('id');
    this.currentUser = this.authService.getCurrentUser();
    this.isProfessor = this.currentUser?.role === 'Professor';
    
    if (this.classroomId) {
      this.loadClassroom();
    }
  }

  loadClassroom(): void {
    this.isLoading = true;
    // TODO: Implementar carregamento da turma e mensagens
    setTimeout(() => {
      this.messages = [];
      this.isLoading = false;
    }, 1000);
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.classroomId) {
      // TODO: Implementar envio de mensagem via SignalR
      const message: ClassroomMessage = {
        id: Date.now().toString(),
        classroomId: this.classroomId,
        senderId: this.currentUser?.id || '',
        senderName: this.currentUser?.fullName || '',
        senderRole: this.currentUser?.role || '',
        content: this.newMessage,
        sentAt: new Date().toISOString(),
        isEdited: false
      };

      this.messages.push(message);
      this.newMessage = '';
    }
  }

  startVideoCall(): void {
    // TODO: Implementar início de videochamada
    this.snackBar.open('Iniciando videochamada...', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  startScreenShare(): void {
    if (!this.isProfessor) {
      this.snackBar.open('Apenas professores podem compartilhar a tela', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    // TODO: Implementar compartilhamento de tela
    this.snackBar.open('Iniciando compartilhamento de tela...', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isMyMessage(message: ClassroomMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }
}
