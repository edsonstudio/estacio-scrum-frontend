import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

export interface AssignmentSubmission {
  title: string;
  description: string;
  subject: string;
}

@Component({
  selector: 'app-upload-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './upload-assignment.component.html',
  styleUrls: ['./upload-assignment.component.scss']
})
export class UploadAssignmentComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  isStudent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isStudent = this.authService.hasRole('Aluno');
    
    if (!this.isStudent) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      subject: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('Arquivo muito grande. Máximo permitido: 10MB', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      // Validar extensão do arquivo (apenas PDF)
      const allowedExtensions = ['.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        this.snackBar.open('Apenas arquivos PDF são permitidos para tarefas', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isLoading = true;

      const assignmentData: AssignmentSubmission = {
        title: this.uploadForm.value.title,
        description: this.uploadForm.value.description,
        subject: this.uploadForm.value.subject
      };

      // TODO: Implementar chamada para API de upload de tarefas
      console.log('Enviando tarefa:', assignmentData, this.selectedFile);
      
      // Simular upload
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Tarefa enviada com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.resetForm();
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
      if (!this.selectedFile) {
        this.snackBar.open('Por favor, selecione um arquivo PDF', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Getters para facilitar o acesso aos controles no template
  get title() { return this.uploadForm.get('title'); }
  get description() { return this.uploadForm.get('description'); }
  get subject() { return this.uploadForm.get('subject'); }
}
