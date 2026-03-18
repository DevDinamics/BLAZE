import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth'; 
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';

// 👇 TODOS LOS ÍCONOS AHORA SON OUTLINE PARA EL MODO LIGHT PREMIUM
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

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    // 👇 REGISTRAMOS LOS NUEVOS ÍCONOS OUTLINE
    addIcons({ 
      personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, 
      arrowForwardOutline, arrowBackOutline, checkmarkCircleOutline, alertCircleOutline
    });
  }

  ngOnInit() {}

  async registrar() {
    // 1. Validaciones básicas (mantenemos la lógica intacta)
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.password) {
      this.mostrarMensaje('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.usuario.password.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    this.cargando = true;

    try {
      // 2. Enviamos los datos al servicio (Mantenemos el fallback de 'alumno' para la BD)
      await this.authService.registrar(
        this.usuario.email, 
        this.usuario.password, 
        this.usuario.nombre, 
        'alumno', 
        '' 
      );

      this.mostrarMensaje('¡Cuenta creada! Prepárate para lo que viene 🔥', 'success');
      
      // 3. Redirección OBLIGATORIA al Onboarding (Flujo Pro)
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

  // Toast minimalista estilo iOS
  async mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      position: 'top', // Arriba, debajo de la isla
      mode: 'ios',
      // Aplicamos nuestra clase base + una clase dinámica para el color del ícono
      cssClass: `apple-pill-toast toast-${color}`, 
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }

  // Función para regresar sutilmente si lo necesitan
  regresar() {
    this.navCtrl.back();
  }
}