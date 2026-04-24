import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth'; 
import { RouterLink } from '@angular/router';
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
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class RegistroPage implements OnInit {

  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  mostrarPassword = false;
  cargando = false;

  dominiosBloqueados = [
    'yopmail.com', 'temp-mail.org', '10minutemail.com', 
    'guerrillamail.com', 'mailinator.com', 'sharklasers.com'
  ];

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
    if (this.dominiosBloqueados.includes(dominio)) {
      return false;
    }
    return true;
  }

  async registrar() {
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.password) {
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

    this.cargando = true;

    try {
      // 1. Registramos al usuario (el AuthService envía el correo de verificación por detrás)
      await this.authService.registrar(
        this.usuario.email, 
        this.usuario.password, 
        this.usuario.nombre
      );

      this.mostrarMensaje('¡Bienvenido! Te enviamos un correo para verificar tu cuenta. 🚀', 'success');
      
      // 2. PASE DE CORTESÍA: Como Firebase ya inició su sesión, lo mandamos directo al Onboarding
      // sin cerrarle la sesión, logrando la misma fluidez que Google.
      this.navCtrl.navigateRoot('/onboarding');

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