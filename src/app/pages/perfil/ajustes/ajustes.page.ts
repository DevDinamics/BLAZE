import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';

import { 
  arrowBack, save, camera, notifications, moon, 
  lockClosed, body, swapVertical, speedometer, calculator, eye, eyeOff 
} from 'ionicons/icons';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AjustesPage implements OnInit {

  perfil = {
    nombre: 'Diego',
    apellido: 'Coach',
    peso: 78.5, // kg
    altura: 178, // cm
    email: 'diego@fitgo.com'
  };

  configuracion = {
    notificaciones: true,
    modoOscuro: true,
    sonidos: true
  };

  // 👇 VARIABLES PARA CONTRASEÑA
  passwords = {
    actual: '',
    nueva: '',
    confirmar: ''
  };
  mostrarPass = false;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    // Registramos los nuevos iconos
    addIcons({ arrowBack, save, camera, notifications, moon, lockClosed, body, swapVertical, speedometer, calculator, eye, eyeOff });
  }

  ngOnInit() {}

  regresar() {
    this.navCtrl.back();
  }

  // --- CÁLCULOS AUTOMÁTICOS DE IMC ---
  get imcValor(): number {
    if (!this.perfil.peso || !this.perfil.altura) return 0;
    const alturaMetros = this.perfil.altura / 100;
    const resultado = this.perfil.peso / (alturaMetros * alturaMetros);
    return parseFloat(resultado.toFixed(1));
  }

  get imcEstado(): string {
    const imc = this.imcValor;
    if (imc < 18.5) return 'Bajo Peso';
    if (imc >= 18.5 && imc < 24.9) return 'Peso Saludable';
    if (imc >= 25 && imc < 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  get imcColor(): string {
    const imc = this.imcValor;
    if (imc < 18.5) return 'text-blue-400';
    if (imc >= 18.5 && imc < 24.9) return 'text-green-400';
    if (imc >= 25 && imc < 29.9) return 'text-yellow-400';
    return 'text-red-500';
  }
  // ------------------------------------

  // 👇 LÓGICA DE CONTRASEÑA
  togglePass() { this.mostrarPass = !this.mostrarPass; }

  async cambiarPassword() {
    // 1. Validar campos vacíos
    if (!this.passwords.actual || !this.passwords.nueva || !this.passwords.confirmar) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos ⚠️',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      return;
    }

    // 2. Validar coincidencia
    if (this.passwords.nueva !== this.passwords.confirmar) {
      const toast = await this.toastCtrl.create({
        message: 'Las contraseñas nuevas no coinciden ❌',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      toast.present();
      return;
    }

    // 3. Éxito
    const toast = await this.toastCtrl.create({
      message: 'Contraseña actualizada correctamente 🔒',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    toast.present();
    
    // Limpiar campos
    this.passwords = { actual: '', nueva: '', confirmar: '' };
  }

  async guardarCambios() {
    console.log('Guardando...', this.perfil);

    const toast = await this.toastCtrl.create({
      message: 'Perfil actualizado correctamente ✅',
      duration: 2000,
      position: 'top',
      color: 'success',
      cssClass: 'text-center'
    });
    toast.present();
    
    setTimeout(() => {
      this.navCtrl.back();
    }, 500);
  }
}