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

  user$ = user(this.auth);

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

  async validarCodigoInvitacion(codigo: string): Promise<boolean> {
    try {
      const invitacionesRef = collection(this.firestore, 'invitaciones');
      const q = query(invitacionesRef, where('codigo', '==', codigo), where('activo', '==', true));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error validando código:', error);
      return false;
    }
  }

  async registrar(email: string, pass: string, nombre: string) {
    const credencial = await createUserWithEmailAndPassword(this.auth, email, pass);
    const uid = credencial.user.uid;
    await sendEmailVerification(credencial.user);
    await setDoc(doc(this.firestore, 'usuarios', uid), {
      uid, email, nombre,
      rol: 'pendiente',
      onboardingCompletado: false,
      fechaRegistro: new Date(),
      foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
      licenciaUsada: 'N/A'
    });
    return uid;
  }

  async login(email: string, pass: string) {
    const credencial = await signInWithEmailAndPassword(this.auth, email, pass);
    return credencial.user;
  }

  // ✅ Inicia el redirect a Google — la app navega a Google y regresa
  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithRedirect(this.auth, provider);
    // La app se va a Google aquí — el resultado se procesa en manejarResultadoGoogle()
  }

  // ✅ Se llama en ionViewDidEnter del login — recoge el resultado al regresar de Google
  async manejarResultadoGoogle() {
    try {
      const resultado = await getRedirectResult(this.auth);
      if (!resultado) return null; // No venimos de Google, flujo normal

      const user = resultado.user;
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
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

      return user; // Regresamos el usuario para que login.page lo use
    } catch (error: any) {
      console.error('Error getRedirectResult:', error);
      return null;
    }
  }

  logout() {
    return signOut(this.auth);
  }
}