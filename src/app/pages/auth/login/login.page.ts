import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth'; // 👈 Importamos nuestro servicio

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

  modalRecuperarAbierto = false;
  emailRecuperacion = '';
  enviandoCorreo = false;

  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com', 
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService // 👈 Lo inyectamos
  ) {
    addIcons({ 
      mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
      arrowForwardOutline, logoGoogle, logoApple, checkmarkCircleOutline, 
      alertCircleOutline, keyOutline 
    });
  }

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      const esLoginPorCorreo = user.providerData.some(p => p.providerId === 'password');
      if (esLoginPorCorreo && !user.emailVerified) {
        this.auth.signOut();
      } else {
        this.redirigirPorRol(user.uid);
      }
    }
  }

  esEmailSeguro(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    const dominio = email.split('@')[1].toLowerCase();
    if (this.dominiosBloqueados.includes(dominio)) {
      return false;
    }
    return true;
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  abrirModalRecuperar() {
    this.emailRecuperacion = this.credenciales.email ? this.credenciales.email : '';
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
      console.error(error);
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
  // LOGIN NORMAL Y GOOGLE
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
      const userCredential = await signInWithEmailAndPassword(this.auth, this.credenciales.email, this.credenciales.password);

      // 👇 PASE VIP PARA ADMIN Y CADENERO PARA EL RESTO
     /* const esAdminVIP = this.credenciales.email.toLowerCase() === 'admin@fitgo.com';
      
      if (!userCredential.user.emailVerified && !esAdminVIP) {
        this.mostrarMensaje('⚠️ Verifica tu correo haciendo clic en el enlace que te enviamos.', 'warning');
        await this.auth.signOut(); 
        this.cargando = false;
        return; 
      }
        */

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
      // 👇 Usamos la magia de nuestro auth.service.ts
      const user = await this.authService.loginConGoogle();
      if (user) {
        await this.redirigirPorRol(user.uid);
      }
    } catch (error: any) {
      console.error(error);
      this.cargandoGoogle = false;
      if (error.code !== 'auth/popup-closed-by-user') {
        this.mostrarMensaje('Error al iniciar con Google.', 'danger');
      }
    }
  }

  loginApple() {
    this.mostrarMensaje('El inicio de sesión con Apple estará disponible muy pronto. 🍏', 'warning');
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

        // 👇 EL FILTRO MAESTRO: Si es pendiente, directo al Onboarding
        if (rol === 'pendiente' || !onboardingCompletado) { 
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