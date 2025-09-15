import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const professorGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('Professor')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const studentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('Aluno')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
