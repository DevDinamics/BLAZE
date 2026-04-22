import { Injectable, inject } from '@angular/core';
import { 
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, user, GoogleAuthProvider, 
  signInWithRedirect, getRedirectResult, // 👈 NUEVOS IMPORTS DE REDIRECCIÓN
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

  // Observable: Quién está conectado
  user$ = user(this.auth);

  // Observable: Datos completos del usuario (incluyendo rol)
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
  // 2. REGISTRO LITE (EMAIL/PASS)
  // ==========================================
  async registrar(email: string, pass: string, nombre: string) {
    try {
      const credencial = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = credencial.user.uid;

      // DISPARAMOS EL CORREO DE VERIFICACIÓN
      await sendEmailVerification(credencial.user);

      // Guardamos la base del perfil con rol "pendiente"
      const datosUsuario = {
        uid: uid,
        email: email,
        nombre: nombre,
        rol: 'pendiente', 
        onboardingCompletado: false, 
        fechaRegistro: new Date(),
        foto: `https://ui-avatars.com/api/?name=${nombre}&background=random`,
        licenciaUsada: 'N/A' 
      };

      await setDoc(doc(this.firestore, 'usuarios', uid), datosUsuario);
      return uid;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // 3. LOGIN TRADICIONAL
  // ==========================================
  async login(email: string, pass: string) {
    try {
      const credencial = await signInWithEmailAndPassword(this.auth, email, pass);
      return credencial.user;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // 🌐 4. LOGIN CON GOOGLE (VERSIÓN REDIRECT)
  // ==========================================
  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    try {
      // 👇 Disparamos la redirección. El navegador se irá a Google entero.
      await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error('Error al redirigir a Google:', error);
      throw error;
    }
  }

  // 👇 NUEVA FUNCIÓN: Atrapa al usuario cuando regresa de Google
  async procesarRedireccionGoogle() {
    try {
      const credencial = await getRedirectResult(this.auth);

      if (credencial && credencial.user) {
        const user = credencial.user;
        const userRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || 'Nuevo Guerrero', 
            foto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'G'}&background=random`,
            rol: 'pendiente', 
            onboardingCompletado: false, 
            xpTotal: 0,
            fechaRegistro: new Date(),
            licenciaUsada: 'Google OAuth'
          });
        }
        return user; // Retornamos el usuario listo para entrar
      }
      return null; // Si no venimos de redirección, regresa nulo
    } catch (error) {
      console.error('Error procesando redirección de Google:', error);
      throw error;
    }
  }

  // ==========================================
  // 5. LOGOUT
  // ==========================================
  logout() {
    return signOut(this.auth);
  }
}