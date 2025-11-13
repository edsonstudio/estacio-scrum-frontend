import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // 👇 MOCK LOGIN (sem backend)
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password, role } = this.loginForm.value;

      const normalizedRole = role?.toLowerCase();
      const normalizedEmail = email?.toLowerCase();
      const normalizedPassword = password?.trim();

      // Mock flexível (aceita variações)
      const isProfessor =
        normalizedRole === 'professor' &&
        normalizedEmail === 'professor@teste.com' &&
        normalizedPassword === '123456';

      const isAluno =
        normalizedRole === 'aluno' &&
        normalizedEmail === 'aluno@teste.com' &&
        normalizedPassword === '123456';

      if (isProfessor || isAluno) {
        const mockUser = {
          fullName: isProfessor ? 'João Carlos' : 'Pedro José',
          role: isProfessor ? 'Professor' : 'Aluno',
          email
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));

        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        }, 800);
      } else {
        this.isLoading = false;
        this.errorMessage =
          'Credenciais inválidas.';
      }
    } else {
      this.markFormGroupTouched();
    }
  }


  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
