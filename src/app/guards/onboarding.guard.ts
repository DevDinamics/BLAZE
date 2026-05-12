import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { switchMap, map, filter, take } from 'rxjs/operators';
import { from, of } from 'rxjs';

/**
 * 🛡️ ONBOARDING GUARD
 * Solo deja entrar al onboarding a usuarios que:
 *   1. Tienen sesión activa
 *   2. NO han completado el onboarding
 *
 * Sin sesión              → /login
 * Con sesión + completado → su dashboard
 * Con sesión + pendiente  → deja pasar ✅
 *
 * IMPORTANTE: Usamos getDoc() en lugar de docData() para leer los datos
 * UNA sola vez y siempre frescos desde el servidor, evitando que el guard
 * lea datos cacheados mientras el onboarding acaba de escribir.
 */
export const onboardingGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
    filter(user => user !== undefined), // Espera a que Firebase inicialice
    take(1),
    switchMap(user => {
      if (!user) {
        return of(router.createUrlTree(['/login']));
      }

      // ✅ Usamos getDoc() (promesa de una sola lectura) en lugar de docData()
      // (observable que puede devolver caché). Esto garantiza datos frescos.
      const docRef = doc(firestore, `usuarios/${user.uid}`);
      return from(getDoc(docRef)).pipe(
        map(snapshot => {
          if (!snapshot.exists()) {
            // No tiene perfil en Firestore — algo raro, dejamos entrar al onboarding
            return true;
          }

          const data = snapshot.data();

          if (data && data['onboardingCompletado'] === true && data['rol'] !== 'pendiente') {
            // Ya completó el onboarding → lo mandamos a su dashboard
            const ruta = data['rol'] === 'coach' ? '/coach/dashboard' : '/entreno';
            return router.createUrlTree([ruta]);
          }

          // Onboarding pendiente → puede entrar ✅
          return true;
        })
      );
    })
  );
};