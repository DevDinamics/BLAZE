import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { switchMap, map, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * 🛡️ AUTH GUARD
 * Protege rutas que requieren sesión activa Y onboarding completado.
 * Si no hay sesión → /login
 * Si hay sesión pero onboarding pendiente → /onboarding
 * Si todo OK → deja pasar ✅
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
    // 🔑 CLAVE: filter(user => user !== undefined) espera a que Firebase
    // termine de inicializar antes de tomar una decisión.
    // Sin esto, en producción Firebase emite 'undefined' primero y el guard
    // cree que no hay sesión cuando sí la hay.
    filter(user => user !== undefined),
    take(1),
    switchMap(user => {
      if (!user) {
        // Sin sesión → login
        return of(router.createUrlTree(['/login']));
      }

      // Hay sesión: verificamos que el onboarding esté completo
      const docRef = doc(firestore, `usuarios/${user.uid}`);
      return docData(docRef).pipe(
        take(1),
        map((data: any) => {
          if (!data || !data.onboardingCompletado || data.rol === 'pendiente') {
            // Sesión OK pero onboarding incompleto → los mandamos a terminar
            return router.createUrlTree(['/onboarding']);
          }
          // Todo en orden ✅
          return true;
        })
      );
    })
  );
};