import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialService, CreateMaterial } from '../../../core/material.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-material-upload',
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
  templateUrl: './material-upload.component.html',
  styleUrls: ['./material-upload.component.scss']
})
export class MaterialUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  isProfessor = false;

  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<MaterialUploadComponent>);

  ngOnInit(): void {
    this.isProfessor = this.authService.hasRole('Professor');
    this.initializeForm();
  }

  private initializeForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      link: ['', [Validators.maxLength(500)]]
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

      // Validar extensão do arquivo
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        this.snackBar.open('Tipo de arquivo não permitido', 'Fechar', {
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

      const materialData: CreateMaterial = {
        title: this.uploadForm.value.title,
        description: this.uploadForm.value.description,
        link: this.uploadForm.value.link || undefined
      };

      this.materialService.uploadMaterial(materialData, this.selectedFile).subscribe({
        next: (response) => {
          console.log('Material enviado com sucesso:', response);
          this.isLoading = false;
          this.snackBar.open('Material enviado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.resetForm();
          this.dialogRef.close(true); // Fechar dialog e retornar true para indicar sucesso
        },
        error: (error) => {
          console.error('Erro ao enviar material:', error);
          this.isLoading = false;
          
          let errorMessage = 'Erro ao enviar material';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          }

          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
      if (!this.selectedFile) {
        this.snackBar.open('Por favor, selecione um arquivo', 'Fechar', {
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

  cancel(): void {
    this.dialogRef.close(false);
  }

  // Getters para facilitar o acesso aos controles no template
  get title() { return this.uploadForm.get('title'); }
  get description() { return this.uploadForm.get('description'); }
  get link() { return this.uploadForm.get('link'); }
}
