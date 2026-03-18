import { Injectable, inject } from '@angular/core';
// 👇 1. IMPORTAMOS LAS HERRAMIENTAS DE GOOGLE (GoogleAuthProvider y signInWithPopup)
import { 
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, user, GoogleAuthProvider, signInWithPopup 
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
  // 2. REGISTRO TRADICIONAL (EMAIL/PASS)
  // ==========================================
  async registrar(email: string, pass: string, nombre: string, rol: 'coach' | 'alumno', codigo?: string) {
    try {
      // --- 🚨 ZONA DE SEGURIDAD ---
      if (rol === 'coach') {
        if (!codigo) throw new Error('code-required');
        const esValido = await this.validarCodigoInvitacion(codigo);
        if (!esValido) throw new Error('invalid-code');
      }
      // -----------------------------

      const credencial = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = credencial.user.uid;

      const datosUsuario = {
        uid: uid,
        email: email,
        nombre: nombre,
        rol: rol,
        fechaRegistro: new Date(),
        foto: `https://ui-avatars.com/api/?name=${nombre}&background=random`,
        licenciaUsada: codigo || 'N/A' 
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
  // 🌐 4. LOGIN CON GOOGLE (NUEVO)
  // ==========================================
  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    // Solicitamos acceso explícito al perfil y correo
    provider.addScope('profile');
    provider.addScope('email');

    try {
      // Abre la ventana emergente de Google
      const credencial = await signInWithPopup(this.auth, provider);
      const user = credencial.user;

      // Verificamos si el usuario ya existe en nuestra base de datos
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userRef);

      // Si es la PRIMERA VEZ que entra con Google, le creamos su ficha automáticamente
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          nombre: user.displayName || 'Nuevo Guerrero', // 🔥 Google nos da su nombre real
          foto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'G'}&background=random`, // 🔥 Google nos da su avatar
          rol: 'alumno', // Por defecto los ingresos por Google son alumnos
          xpTotal: 0,
          fechaRegistro: new Date(),
          licenciaUsada: 'Google OAuth'
        });
      }

      return user;
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
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