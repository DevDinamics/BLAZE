import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { switchMap, map, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * 🛡️ PUBLIC GUARD
 * Protege rutas públicas (login, registro) para que usuarios con sesión
 * activa no puedan volver a verlas.
 *
 * Sin sesión           → deja pasar ✅ (puede ver login/registro)
 * Con sesión + pendiente → /onboarding
 * Con sesión + rol final → su dashboard directamente
 *
 * ⚠️ ANTES mandaba siempre a /onboarding, lo que causaba un loop:
 *   publicGuard → /onboarding → onboardingGuard → /dashboard → publicGuard...
 *   Ahora consultamos Firestore para saber exactamente a dónde ir.
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
    filter(user => user !== undefined), // Espera inicialización de Firebase
    take(1),
    switchMap(user => {
      if (!user) {
        // Sin sesión → puede ver login/registro ✅
        return of(true);
      }

      // Hay sesión: revisamos su estado en Firestore para redirigir correctamente
      const docRef = doc(firestore, `usuarios/${user.uid}`);
      return docData(docRef).pipe(
        take(1),
        map((data: any) => {
          if (!data || !data.onboardingCompletado || data.rol === 'pendiente') {
            // Sesión activa pero sin onboarding → a completarlo
            return router.createUrlTree(['/onboarding']);
          }
          // Ya tiene cuenta completa → su dashboard directo
          const ruta = data.rol === 'coach' ? '/coach/dashboard' : '/entreno';
          return router.createUrlTree([ruta]);
        })
      );
    })
  );
};