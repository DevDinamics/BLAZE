import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { switchMap, map, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * 🛡️ ONBOARDING GUARD
 * Solo deja entrar al onboarding a usuarios que:
 *   1. Tienen sesión activa
 *   2. NO han completado el onboarding (rol === 'pendiente' o onboardingCompletado === false)
 *
 * Sin sesión             → /login
 * Con sesión + completado → su dashboard (ya no necesita onboarding)
 * Con sesión + pendiente  → deja pasar ✅
 */
export const onboardingGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
    // 🔑 Esperamos a que Firebase decida (undefined = inicializando, null = sin sesión, User = con sesión)
    filter(user => user !== undefined),
    take(1),
    switchMap(user => {
      if (!user) {
        // Sin sesión → no puede estar en onboarding
        return of(router.createUrlTree(['/login']));
      }

      const docRef = doc(firestore, `usuarios/${user.uid}`);
      return docData(docRef).pipe(
        take(1),
        map((data: any) => {
          if (data && data.onboardingCompletado && data.rol !== 'pendiente') {
            // Ya completó el onboarding → lo mandamos a su lugar
            const ruta = data.rol === 'coach' ? '/coach/dashboard' : '/entreno';
            return router.createUrlTree([ruta]);
          }
          // Onboarding pendiente → puede entrar ✅
          return true;
        })
      );
    })
  );
};