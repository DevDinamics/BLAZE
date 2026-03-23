import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // authState observa el estado de Firebase en tiempo real
  return authState(auth).pipe(
    map(user => {
      if (user) {
        return true; // 🟢 Tiene sesión, déjalo pasar
      } else {
        return router.createUrlTree(['/login']); // 🔴 No tiene sesión, patada al login
      }
    })
  );
};