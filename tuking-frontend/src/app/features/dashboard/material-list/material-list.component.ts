import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialService, Material } from '../../../core/material.service';
import { AuthService } from '../../../core/auth.service';
import { MaterialUploadComponent } from '../material-upload/material-upload.component';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss']
})
export class MaterialListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'description', 'fileName', 'createdAt', 'actions'];
  materials: Material[] = [];
  isLoading = false;
  isProfessor = false;

  private materialService = inject(MaterialService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.isProfessor = this.authService.hasRole('Professor');
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.isLoading = true;
    this.materialService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar materiais:', error);
        this.snackBar.open('Erro ao carregar materiais', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.isLoading = false;
      }
    });
  }

  downloadMaterial(material: Material): void {
    this.materialService.downloadMaterial(material.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = material.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Download iniciado', 'Fechar', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Erro ao fazer download:', error);
        this.snackBar.open('Erro ao fazer download', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteMaterial(material: Material): void {
    if (confirm(`Tem certeza que deseja excluir o material "${material.title}"?`)) {
      this.materialService.deleteMaterial(material.id).subscribe({
        next: () => {
          this.snackBar.open('Material excluído com sucesso', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadMaterials(); // Recarregar a lista
        },
        error: (error) => {
          console.error('Erro ao excluir material:', error);
          this.snackBar.open('Erro ao excluir material', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  editMaterial(material: Material): void {
    // TODO: Implementar modal de edição
    console.log('Edit material:', material);
    this.snackBar.open('Funcionalidade de edição em desenvolvimento', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  openLink(link: string): void {
    window.open(link, '_blank');
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

  createNewMaterial(): void {
    const dialogRef = this.dialog.open(MaterialUploadComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recarregar a lista de materiais após upload bem-sucedido
        this.loadMaterials();
      }
    });
  }
}