import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { 
  IonContent, IonIcon, IonSpinner, IonModal, 
  NavController, ToastController 
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth'; 
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
  arrowForwardOutline, arrowBackOutline, checkmarkCircleOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner, IonModal]
})
export class RegistroPage implements OnInit {

  usuario = {
    nombre: '',
    email: '',
    password: '',
    repetirPassword: ''
  };

  mostrarPassword = false;
  mostrarPassword2 = false;
  cargando = false;

  mostrarModalVerificacion = false;

  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com', 
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

  iconPerson = personOutline;
  iconMail = mailOutline;
  iconLock = lockClosedOutline;
  iconEye = eyeOutline;
  iconEyeOff = eyeOffOutline;
  iconArrowForward = arrowForwardOutline;
  iconArrowBack = arrowBackOutline;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
      arrowForwardOutline, arrowBackOutline, checkmarkCircleOutline, alertCircleOutline
    });
  }

  ngOnInit() {}

  esEmailSeguro(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    const dominio = email.split('@')[1].toLowerCase();
    return !this.dominiosBloqueados.includes(dominio);
  }

  async registrar() {
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.password || !this.usuario.repetirPassword) {
      this.mostrarMensaje('Por favor completa todos los campos', 'warning');
      return;
    }

    if (!this.esEmailSeguro(this.usuario.email)) {
      this.mostrarMensaje('Por favor usa un correo electrónico válido', 'warning');
      return;
    }

    if (this.usuario.password.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    if (this.usuario.password !== this.usuario.repetirPassword) {
      this.mostrarMensaje('Las contraseñas no coinciden', 'danger');
      return;
    }

    this.cargando = true;

    try {
      // 1. Registramos al usuario y enviamos correo
      await this.authService.registrar(
        this.usuario.email, 
        this.usuario.password, 
        this.usuario.nombre
      );

      // 2. 🛡️ CERRAR SESIÓN INMEDIATAMENTE
      // Obliga a que verifique antes de poder iniciar sesión
      await this.authService.logout();

      this.cargando = false;
      // Mostramos el modal estando AÚN en la pantalla de registro
      this.mostrarModalVerificacion = true;

    } catch (error: any) {
      this.cargando = false;
      console.error('Error Registro:', error);
      
      let mensaje = 'No se pudo crear la cuenta';
      if (error.code === 'auth/email-already-in-use') mensaje = 'Este correo ya está registrado';
      if (error.code === 'auth/invalid-email') mensaje = 'El correo no es válido';
      if (error.code === 'auth/weak-password') mensaje = 'La contraseña es muy débil';
      
      this.mostrarMensaje(mensaje, 'danger');
    }
  }

  irAlLogin() {
    this.mostrarModalVerificacion = false;
    this.navCtrl.navigateRoot('/login');
  }

  async mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 4000, 
      position: 'top', 
      mode: 'ios',
      cssClass: `apple-pill-toast toast-${color}`, 
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    toast.present();
  }

  regresar() {
    this.navCtrl.back();
  }
}