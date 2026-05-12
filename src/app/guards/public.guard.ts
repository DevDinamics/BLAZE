import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { switchMap, filter, take } from 'rxjs/operators';
import { from, of } from 'rxjs';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);
  const injector = inject(EnvironmentInjector);

  return authState(auth).pipe(
    filter(user => user !== undefined),
    take(1),
    switchMap(user => {
      if (!user) {
        return of(true); // Sin sesión → puede ver login/registro ✅
      }

      return from(
        runInInjectionContext(injector, async () => {
          const docRef = doc(firestore, `usuarios/${user.uid}`);
          const snapshot = await getDoc(docRef);

          if (!snapshot.exists()) {
            return router.createUrlTree(['/onboarding']);
          }

          const data = snapshot.data();

          if (!data['onboardingCompletado'] || data['rol'] === 'pendiente') {
            return router.createUrlTree(['/onboarding']);
          }

          const ruta = data['rol'] === 'coach' ? '/coach/dashboard' : '/entreno';
          return router.createUrlTree([ruta]);
        })
      );
    })
  );
};