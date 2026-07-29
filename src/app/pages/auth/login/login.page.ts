import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Standalone Imports puros
import { 
  IonContent, IonIcon, IonModal, IonSpinner, 
  NavController, ToastController 
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
  arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, 
  alertCircleOutline, keyOutline 
} from 'ionicons/icons';

import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon, IonModal, IonSpinner]
})
export class LoginPage {

  credenciales = { email: '', password: '' };

  mostrarPassword = false;
  cargando = false;
  cargandoGoogle = false;

  modalRecuperarAbierto = false;
  emailRecuperacion = '';
  enviandoCorreo = false;

  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

  // Bindings directos para los íconos
  iconMail = mailOutline;
  iconLock = lockClosedOutline;
  iconEye = eyeOutline;
  iconEyeOff = eyeOffOutline;
  iconArrow = arrowForwardOutline;
  iconGoogle = logoGoogle;
  iconApple = logoApple;
  iconKey = keyOutline;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {
    addIcons({ 
      mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
      arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, 
      alertCircleOutline, keyOutline 
    });
  }

  esEmailSeguro(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;
    const dominio = email.split('@')[1].toLowerCase();
    return !this.dominiosBloqueados.includes(dominio);
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  abrirModalRecuperar() {
    this.emailRecuperacion = this.credenciales.email || '';
    this.modalRecuperarAbierto = true;
  }

  async enviarCorreoRecuperacion() {
    const emailLimpio = this.emailRecuperacion.trim().toLowerCase();

    if (!emailLimpio || !this.esEmailSeguro(emailLimpio)) {
      this.mostrarMensaje('Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    this.enviandoCorreo = true;

    try {
      // 🚀 Enviamos directamente mediante Firebase Auth
      await sendPasswordResetEmail(this.auth, emailLimpio);
      
      this.modalRecuperarAbierto = false;
      this.mostrarMensaje('Enlace enviado. Revisa tu bandeja de entrada o spam.', 'success');

    } catch (error: any) {
      console.error('Error de recuperación:', error);
      
      // Manejo exacto de códigos de respuesta de Firebase Auth
      if (['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-email'].includes(error.code)) {
        this.mostrarMensaje('No existe ninguna cuenta registrada con este correo.', 'danger');
      } else if (error.code === 'auth/too-many-requests') {
        this.mostrarMensaje('Demasiados intentos. Intenta más tarde.', 'warning');
      } else {
        this.modalRecuperarAbierto = false;
        this.mostrarMensaje('Si el correo está registrado, recibirás un enlace en breve.', 'success');
      }
    } finally {
      this.enviandoCorreo = false;
    }
  }

  // ==========================================
  // LOGIN MANUAL
  // ==========================================
  async login() {
    if (!this.credenciales.email || !this.credenciales.password) {
      this.mostrarMensaje('Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }
    if (!this.esEmailSeguro(this.credenciales.email)) {
      this.mostrarMensaje('Por favor usa un proveedor de correo válido.', 'warning');
      return;
    }

    this.cargando = true;

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth, this.credenciales.email, this.credenciales.password
      );

      const esAdmin = this.credenciales.email.toLowerCase() === 'admin@fitgo.com';
      if (!userCredential.user.emailVerified && !esAdmin) {
        this.mostrarMensaje('Verifica tu correo haciendo clic en el enlace que te enviamos.', 'warning');
        await this.auth.signOut();
        this.cargando = false;
        return;
      }

      await this.redirigirPorRol(userCredential.user.uid);

    } catch (error: any) {
      this.cargando = false;
      this.manejarErrorFirebase(error.code);
    }
  }

  // ==========================================
  // LOGIN GOOGLE
  // ==========================================
  async loginGoogle() {
    this.cargandoGoogle = true;
    try {
      const user = await this.authService.loginConGoogle();
      if (user && user.uid) {
        await this.redirigirPorRol(user.uid);
      } else {
        this.cargandoGoogle = false;
      }
    } catch (error: any) {
      this.cargandoGoogle = false;
      if (error.code !== 'auth/popup-closed-by-user') {
        this.mostrarMensaje('Error al iniciar con Google.', 'danger');
      }
    }
  }

  // ==========================================
  // REDIRECCIÓN POR ROL
  // ==========================================
  async redirigirPorRol(uid: string) {
    try {
      const userDocRef = doc(this.firestore, 'usuarios', uid);
      const userDocSnap = await getDoc(userDocRef);

      this.cargando = false;
      this.cargandoGoogle = false;

      if (!userDocSnap.exists()) {
        this.mostrarMensaje('No se encontró tu perfil.', 'danger');
        return;
      }

      const data = userDocSnap.data();
      const rol = data['rol'];
      const onboardingComplete = data['onboardingComplete'];

      if (!onboardingComplete || rol === 'pendiente') {
        this.navCtrl.navigateRoot('/onboarding');
        return;
      }

      if (rol === 'coach') {
        this.navCtrl.navigateRoot('/coach/dashboard');
      } else if (rol === 'alumno' || rol === 'atleta') {
        this.navCtrl.navigateRoot('/entreno');
      } else {
        this.mostrarMensaje('No se pudo determinar tu tipo de cuenta.', 'danger');
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
    if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(codigoError)) {
      mensaje = 'Correo o contraseña incorrectos.';
    } else if (codigoError === 'auth/too-many-requests') {
      mensaje = 'Demasiados intentos. Intenta más tarde.';
    }
    this.mostrarMensaje(mensaje, 'danger');
  }
}