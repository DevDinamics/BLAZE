import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { switchMap, map, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1), // Solo tomamos el primer valor para no dejar la suscripción abierta
    switchMap(user => {
      if (!user) {
        // No hay usuario, lo mandamos al login
        return of(router.createUrlTree(['/login']));
      }

      // Si hay usuario, vamos a revisar su documento en Firestore
      const docRef = doc(firestore, `usuarios/${user.uid}`);
      
      // docData es la forma "RxJS" de leer Firestore (hace juego con tu código)
      return docData(docRef).pipe(
        take(1),
        map((data: any) => {
          // Si el documento existe y YA TIENE ROL...
          if (data && data.rol) {
             // 🔴 Ya escogió rol, lo pateamos a su dashboard correspondiente
             const rutaDestino = data.rol === 'coach' ? '/coach/dashboard' : '/entreno/dashboard';
             return router.createUrlTree([rutaDestino]);
          } else {
             // 🟢 No tiene rol asignado. ¡Déjalo entrar al Onboarding!
             return true;
          }
        })
      );
    })
  );
};