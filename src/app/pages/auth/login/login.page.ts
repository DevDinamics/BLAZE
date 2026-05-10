import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth';

import { 
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
  arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, 
  alertCircleOutline, keyOutline 
} from 'ionicons/icons';

import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage {

  credenciales = { email: '', password: '' };

  mostrarPassword = false;
  cargando = false;
  cargandoGoogle = false;

  modalRecuperarAbierto = false;
  emailRecuperacion = '';
  enviandoCorreo = false;

  private authSub: any = null;

  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

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

  async ionViewDidEnter() {
    // Mostramos el spinner mientras resolvemos el estado inicial
    this.cargandoGoogle = true;

    // ✅ PASO 1: Intentamos recoger el resultado de un redirect de Google.
    // Si el usuario venía de loginConGoogle(), aquí procesamos su cuenta.
    // Si no venía de Google, esto devuelve false y no hace nada.
    await this.authService.manejarResultadoGoogle();

    // ✅ PASO 2: El espía de sesión detecta el estado real y redirige.
    // Funciona tanto para login normal como para el resultado de Google.
    this.authSub = onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        await this.redirigirPorRol(user.uid);
      } else {
        this.cargandoGoogle = false;
      }
    });
  }

  ionViewWillLeave() {
    if (this.authSub) {
      this.authSub();
      this.authSub = null;
    }
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
    if (!this.emailRecuperacion || !this.esEmailSeguro(this.emailRecuperacion)) {
      this.mostrarMensaje('Ingresa un correo electrónico válido.', 'warning');
      return;
    }
    this.enviandoCorreo = true;
    try {
      await sendPasswordResetEmail(this.auth, this.emailRecuperacion);
      this.mostrarMensaje('¡Enlace enviado! Revisa tu bandeja de entrada o spam.', 'success');
      this.modalRecuperarAbierto = false;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        this.mostrarMensaje('No encontramos una cuenta con este correo.', 'danger');
      } else {
        this.mostrarMensaje('Si el correo existe, recibirás un enlace en breve.', 'success');
        this.modalRecuperarAbierto = false;
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

      // Verificación de email (excepto admin)
      const esAdmin = this.credenciales.email.toLowerCase() === 'admin@fitgo.com';
      if (!userCredential.user.emailVerified && !esAdmin) {
        this.mostrarMensaje('⚠️ Verifica tu correo haciendo clic en el enlace que te enviamos.', 'warning');
        await this.auth.signOut();
        this.cargando = false;
        return;
      }

      // El onAuthStateChanged del ionViewDidEnter detecta el login y redirige
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
      // Inicia el redirect a Google — la app se va y regresa
      // manejarResultadoGoogle() en ionViewDidEnter recoge el resultado
      await this.authService.loginConGoogle();
    } catch (error: any) {
      this.cargandoGoogle = false;
      this.mostrarMensaje('Error al iniciar con Google.', 'danger');
    }
  }

  loginApple() {
    this.mostrarMensaje('El inicio de sesión con Apple estará disponible muy pronto. 🍏', 'warning');
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
      const onboardingCompletado = data['onboardingCompletado'];

      // Si el onboarding no está completo → a terminarlo
      if (!onboardingCompletado || rol === 'pendiente') {
        this.navCtrl.navigateRoot('/onboarding');
        return;
      }

      // Onboarding completo → su dashboard
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