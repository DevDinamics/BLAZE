import { Injectable, inject } from '@angular/core';
import { 
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, user, GoogleAuthProvider, signInWithRedirect, getRedirectResult,
  sendEmailVerification 
} from '@angular/fire/auth';
import { 
  Firestore, doc, setDoc, getDoc, 
  collection, query, where, getDocs 
} from '@angular/fire/firestore';
import { of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable: quién está conectado
  user$ = user(this.auth);

  // Observable: datos completos del usuario (incluyendo rol)
  perfilCompleto$ = this.user$.pipe(
    switchMap(usuario => {
      if (usuario) {
        const docRef = doc(this.firestore, `usuarios/${usuario.uid}`);
        return getDoc(docRef).then(snapshot => snapshot.data());
      } else {
        return of(null);
      }
    })
  );

  constructor() { }

  // ==========================================
  // 1. VALIDAR CÓDIGO DE INVITACIÓN (COACH)
  // ==========================================
  async validarCodigoInvitacion(codigo: string): Promise<boolean> {
    try {
      const invitacionesRef = collection(this.firestore, 'invitaciones');
      const q = query(
        invitacionesRef,
        where('codigo', '==', codigo),
        where('activo', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error validando código:', error);
      return false;
    }
  }

  // ==========================================
  // 2. REGISTRO (EMAIL / CONTRASEÑA)
  // ==========================================
  async registrar(email: string, pass: string, nombre: string) {
    const credencial = await createUserWithEmailAndPassword(this.auth, email, pass);
    const uid = credencial.user.uid;

    // Enviamos correo de verificación (el usuario lo verifica en su tiempo,
    // pero NO lo bloqueamos para entrar al onboarding)
    await sendEmailVerification(credencial.user);

    // Perfil base con rol 'pendiente' — el onboarding lo completará
    await setDoc(doc(this.firestore, 'usuarios', uid), {
      uid,
      email,
      nombre,
      rol: 'pendiente',
      onboardingCompletado: false,
      fechaRegistro: new Date(),
      foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
      licenciaUsada: 'N/A'
    });

    return uid;
  }

  // ==========================================
  // 3. LOGIN TRADICIONAL (EMAIL / CONTRASEÑA)
  // ==========================================
  async login(email: string, pass: string) {
    const credencial = await signInWithEmailAndPassword(this.auth, email, pass);
    return credencial.user;
  }

  // ==========================================
  // 4. LOGIN CON GOOGLE
  //
  // ✅ Usamos signInWithRedirect en lugar de signInWithPopup porque:
  //   - signInWithPopup falla en navegadores móviles (Safari iOS, WebViews)
  //   - signInWithPopup falla en PWAs y apps en producción
  //   - signInWithRedirect funciona en todas las plataformas
  //
  // Flujo: este método inicia el redirect.
  //        manejarResultadoGoogle() recoge el resultado al volver.
  //        Llama manejarResultadoGoogle() en ionViewDidEnter del LoginPage.
  // ==========================================
  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithRedirect(this.auth, provider);
    // La app se redirige a Google y regresa — el resultado lo maneja manejarResultadoGoogle()
  }

  async manejarResultadoGoogle(): Promise<boolean> {
    try {
      const resultado = await getRedirectResult(this.auth);

      if (!resultado) {
        // No venimos de un redirect de Google — flujo normal, nada que hacer
        return false;
      }

      const user = resultado.user;
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Usuario nuevo: creamos su perfil base
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          nombre: user.displayName || 'Nuevo Guerrero',
          foto: user.photoURL || `https://ui-avatars.com/api/?name=G&background=random`,
          rol: 'pendiente',
          onboardingCompletado: false,
          xpTotal: 0,
          fechaRegistro: new Date(),
          licenciaUsada: 'Google OAuth'
        });
      }

      return true; // Indica que sí había un resultado de Google que procesar
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Error procesando resultado de Google:', error);
      }
      return false;
    }
  }

  // ==========================================
  // 5. LOGOUT
  // ==========================================
  logout() {
    return signOut(this.auth);
  }
}