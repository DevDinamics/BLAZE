import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Observamos el estado en tiempo real, igual que en tu authGuard
  return authState(auth).pipe(
    map(user => {
      if (user) {
        // 🔴 Ya tiene sesión iniciada, ¡sácalo del login/registro!
        return router.createUrlTree(['/onboarding']); 
      } else {
        // 🟢 No tiene sesión, déjalo entrar a loguearse
        return true; 
      }
    })
  );
};