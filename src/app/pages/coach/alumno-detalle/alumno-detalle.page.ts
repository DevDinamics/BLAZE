import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, person, fitness, restaurant, checkmarkCircle, closeCircle, addCircle } from 'ionicons/icons';

@Component({
  selector: 'app-alumno-detalle',
  templateUrl: './alumno-detalle.page.html',
  styleUrls: ['./alumno-detalle.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AlumnoDetallePage implements OnInit {

  // DATOS SIMULADOS DEL ALUMNO
  alumno = {
    nombre: 'Carlos López',
    foto: 'https://i.pravatar.cc/300?u=carlos',
    objetivo: 'Perder Grasa',
    rutina: 'Full Body 3 Días',
    dieta: null as string | null // <--- AQUÍ ESTÁ EL TRUCO: NULL significa que no tiene dieta asignada
  };

  constructor(
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBack, person, fitness, restaurant, checkmarkCircle, closeCircle, addCircle });
  }

  ngOnInit() {}
  
  regresar() { this.navCtrl.back(); }

  // FUNCIÓN PARA ASIGNAR DIETA
  async asignarDieta() {
    // Aquí simularíamos abrir un modal con la lista de "dietas.page"
    // Usaremos un ActionSheet para simular la selección rápida
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar Plantilla de Dieta',
      buttons: [
        {
          text: 'Déficit Estándar (1800 kcal)',
          icon: 'restaurant',
          handler: () => { this.guardarDieta('Déficit Estándar'); }
        },
        {
          text: 'Aumento Masa (3000 kcal)',
          icon: 'restaurant',
          handler: () => { this.guardarDieta('Aumento Masa'); }
        },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async guardarDieta(nombreDieta: string) {
    // 1. Asignamos la dieta al alumno
    this.alumno.dieta = nombreDieta; // Ya no es null

    // 2. Feedback
    const toast = await this.toastCtrl.create({
      message: `Plan "${nombreDieta}" asignado correctamente ✅`,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }
}
