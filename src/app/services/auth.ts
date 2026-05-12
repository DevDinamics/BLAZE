import { Injectable, inject } from '@angular/core';
import { 
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, user, GoogleAuthProvider, signInWithPopup,
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

    // Enviamos correo de verificación
    await sendEmailVerification(credencial.user);

    // Perfil base con rol 'pendiente' — el onboarding lo completará
    await setDoc(doc(this.firestore, 'usuarios', uid), {
      uid,
      email,
      nombre,
      rol: 'pendiente',
      onboardingComplete: false,
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
  // 4. LOGIN CON GOOGLE (popup — funciona en web con dominio autorizado)
  // ==========================================
  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const credencial = await signInWithPopup(this.auth, provider);
    const user = credencial.user;

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
        onboardingComplete: false,
        xpTotal: 0,
        fechaRegistro: new Date(),
        licenciaUsada: 'Google OAuth'
      });
    }

    return user;
  }

  // Mantenemos este método para compatibilidad con login.page.ts
  // Con popup no necesitamos procesar ningún redirect
  async manejarResultadoGoogle(): Promise<boolean> {
    return false;
  }

  // ==========================================
  // 5. LOGOUT
  // ==========================================
  logout() {
    return signOut(this.auth);
  }
}