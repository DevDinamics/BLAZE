import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, person, fitness, restaurant, checkmarkCircle, closeCircle, addCircle, chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-alumno-detalle',
  templateUrl: './alumno-detalle.page.html',
  styleUrls: ['./alumno-detalle.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AlumnoDetallePage implements OnInit {

  // ID del alumno (necesario para el chat)
  alumno = {
    id: '12345', // Asumimos que tienes un ID real del alumno aquí
    nombre: 'Carlos López',
    foto: 'https://i.pravatar.cc/300?u=carlos',
    objetivo: 'Perder Grasa',
    rutina: 'Full Body 3 Días',
    dieta: null as string | null
  };

  private navCtrl = inject(NavController);

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBack, person, fitness, restaurant, checkmarkCircle, closeCircle, addCircle, chatbubblesOutline });
  }

  ngOnInit() {}
  
  regresar() { this.navCtrl.back(); }

  // NUEVA FUNCIÓN PARA CHAT
  iniciarChatConAlumno() {
    this.navCtrl.navigateForward(['/sala-chat'], {
      state: { contacto: this.alumno }
    });
  }

  async asignarDieta() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar Plantilla de Dieta',
      buttons: [
        { text: 'Déficit Estándar (1800 kcal)', icon: 'restaurant', handler: () => { this.guardarDieta('Déficit Estándar'); } },
        { text: 'Aumento Masa (3000 kcal)', icon: 'restaurant', handler: () => { this.guardarDieta('Aumento Masa'); } },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async guardarDieta(nombreDieta: string) {
    this.alumno.dieta = nombreDieta;
    const toast = await this.toastCtrl.create({
      message: `Plan "${nombreDieta}" asignado correctamente ✅`,
      duration: 2000, color: 'success', position: 'top'
    });
    toast.present();
  }
}