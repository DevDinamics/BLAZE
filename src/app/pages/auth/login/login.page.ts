import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';

import { 
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
  arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, alertCircleOutline 
} from 'ionicons/icons';

import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage implements OnInit {

  credenciales = {
    email: '',
    password: ''
  };

  mostrarPassword = false;
  cargando = false;
  cargandoGoogle = false;

  // 🛡️ LISTA NEGRA: Dominios de correos temporales/falsos que no queremos
  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com', 
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
      arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, alertCircleOutline 
    });
  }

  ngOnInit() {
    // 🗑️ Eliminamos el signOut forzado de aquí. 
    // Firebase maneja la sesión entre pestañas automáticamente con IndexedDB.
    // Si el usuario ya tiene sesión activa, lo ideal sería redirigirlo.
    const user = this.auth.currentUser;
    if (user) {
      this.redirigirPorRol(user.uid);
    }
  }

  // 🛡️ FUNCIÓN BLINDADA: Valida formato y dominios
  esEmailSeguro(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false; // Falla si no tiene el formato algo@algo.com

    const dominio = email.split('@')[1].toLowerCase();
    
    // Si el dominio está en la lista negra, lo rebotamos
    if (this.dominiosBloqueados.includes(dominio)) {
      return false;
    }

    return true;
  }

  async login() {
    // 1. Validar campos vacíos
    if (!this.credenciales.email || !this.credenciales.password) {
      this.mostrarMensaje('Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    // 2. Pasar por el "Cadenero" de dominios
    if (!this.esEmailSeguro(this.credenciales.email)) {
      this.mostrarMensaje('Por favor usa un proveedor de correo válido.', 'warning');
      return;
    }

    this.cargando = true;

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.credenciales.email, this.credenciales.password);
      await this.redirigirPorRol(userCredential.user.uid);

    } catch (error: any) {
      console.error(error);
      this.cargando = false;
      this.manejarErrorFirebase(error.code);
    }
  }

  async loginGoogle() {
    this.cargandoGoogle = true;

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await this.redirigirPorRol(user.uid);
      } else {
        await setDoc(userDocRef, {
          nombre: user.displayName || 'Usuario',
          email: user.email,
          foto: user.photoURL || '',
          rol: 'alumno', 
          fechaRegistro: new Date(),
          xpTotal: 0
        });

        this.cargandoGoogle = false;
        this.navCtrl.navigateRoot('/onboarding'); 
      }

    } catch (error: any) {
      console.error(error);
      this.cargandoGoogle = false;
      if (error.code !== 'auth/popup-closed-by-user') {
        this.mostrarMensaje('Error al iniciar con Google.', 'danger');
      }
    }
  }

  async redirigirPorRol(uid: string) {
    try {
      const userDocRef = doc(this.firestore, 'usuarios', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const rol = data['rol'];
        const onboardingCompletado = data['onboardingCompletado'];

        this.cargando = false;
        this.cargandoGoogle = false;

        if (!onboardingCompletado && !data['peso']) { 
           this.navCtrl.navigateRoot('/onboarding');
           return;
        }

        if (rol === 'coach') {
          this.navCtrl.navigateRoot('/coach/dashboard');
        } else if (rol === 'alumno') {
          this.navCtrl.navigateRoot('/entreno');
        } else {
          this.mostrarMensaje('No se pudo determinar tu tipo de cuenta.', 'danger');
        }

      } else {
        this.cargando = false;
        this.cargandoGoogle = false;
        this.mostrarMensaje('No se encontró tu perfil.', 'danger');
      }
    } catch (error) {
      console.error(error);
      this.cargando = false;
      this.cargandoGoogle = false;
      this.mostrarMensaje('Error al leer el perfil.', 'danger');
    }
  }

  async mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      position: 'top', 
      mode: 'ios',
      cssClass: `apple-pill-toast toast-${color}`, 
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    toast.present();
  }

  manejarErrorFirebase(codigoError: string) {
    let mensaje = 'Ocurrió un error al iniciar sesión.';
    if (codigoError === 'auth/invalid-credential' || codigoError === 'auth/user-not-found' || codigoError === 'auth/wrong-password') {
      mensaje = 'Correo o contraseña incorrectos.';
    } else if (codigoError === 'auth/too-many-requests') {
      mensaje = 'Demasiados intentos. Intenta más tarde.';
    }
    this.mostrarMensaje(mensaje, 'danger');
  }
}