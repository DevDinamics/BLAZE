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
      
      // docData es la forma "RxJS" de leer Firestore
      return docData(docRef).pipe(
        take(1),
        map((data: any) => {
          
          // 👇 LA CORRECCIÓN MAESTRA ESTÁ AQUÍ
          // Revisamos si existe, si tiene rol, y SI ESE ROL ES DIFERENTE DE 'pendiente'
          if (data && data.rol && data.rol !== 'pendiente') {
             
             // 🔴 Ya tiene un rol final (coach o alumno), lo pateamos a su dashboard
             // NOTA: Cambié '/entreno/dashboard' por '/entreno' para respetar tu app.routes principal
             const rutaDestino = data.rol === 'coach' ? '/coach/dashboard' : '/entreno';
             return router.createUrlTree([rutaDestino]);
             
          } else {
             // 🟢 No tiene rol, o su rol es 'pendiente'. ¡Déjalo entrar al Onboarding!
             return true;
          }
          
        })
      );
    })
  );
};