import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CoachService } from 'src/app/services/coach';
import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { 
  add, timeOutline, layersOutline, chevronForward, barbell, arrowBack, copy, 
  person, trash, create, close, search, documentTextOutline, folderOpenOutline, 
  personOutline, copyOutline, ellipsisVertical,
  // 👇 Añadimos estos para el nuevo menú de opciones
  createOutline, trashOutline 
} from 'ionicons/icons'; 

@Component({
  selector: 'app-rutinas',
  templateUrl: './rutinas.page.html',
  styleUrls: ['./rutinas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RutinasPage { 

  segmento: string = 'activas'; 
  rutinasActivas: any[] = [];
  misPlantillas: any[] = [];
  cargando = true;

  // 👇 Variables para controlar nuestro propio menú de opciones
  mostrarModalOpciones = false;
  rutinaSeleccionada: any = null;

  constructor(
    private coachService: CoachService, 
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      add, timeOutline, layersOutline, chevronForward, barbell, arrowBack, copy, 
      person, trash, create, close, search, documentTextOutline, folderOpenOutline, 
      personOutline, copyOutline, ellipsisVertical, createOutline, trashOutline 
    }); 
  }

  ionViewWillEnter() {
    this.cargarRutinas();
  }

  async cargarRutinas() {
    this.cargando = true;
    this.authService.user$.subscribe(async user => {
      if (user) {
        try {
          const todas: any = await this.coachService.obtenerMisRutinas(user.uid);
          
          if (todas && Array.isArray(todas)) {
            this.misPlantillas = todas.filter((r: any) => r.esPlantilla === true);
            this.rutinasActivas = todas.filter((r: any) => !r.esPlantilla);
          } else {
            this.misPlantillas = [];
            this.rutinasActivas = [];
          }

        } catch (error) {
          console.error('Error cargando rutinas:', error);
          this.mostrarToast('Error al cargar datos', 'danger');
        } finally {
          this.cargando = false;
        }
      } else {
        this.cargando = false;
      }
    });
  }

  crearNuevo() {
    if (this.segmento === 'plantillas') {
      this.navCtrl.navigateForward(['/coach/crear-rutina', { modo: 'plantilla' }]);
    } else {
      this.navCtrl.navigateForward('/coach/crear-rutina');
    }
  }

  // 👇 1. Abrimos nuestro menú personalizado
  abrirOpciones(rutina: any) {
    this.rutinaSeleccionada = rutina;
    this.mostrarModalOpciones = true;
  }

  // 👇 2. Cerramos el menú
  cerrarOpciones() {
    this.mostrarModalOpciones = false;
    setTimeout(() => this.rutinaSeleccionada = null, 300); // Limpiamos después de la animación
  }

  // 👇 3. Acción: Editar
  editarRutina() {
    const id = this.rutinaSeleccionada?.id;
    this.cerrarOpciones();
    if (id) {
      this.navCtrl.navigateForward(['/coach/crear-rutina', { id: id }]);
    }
  }

  // 👇 4. Acción: Borrar
  iniciarBorrado() {
    const rutina = this.rutinaSeleccionada;
    this.cerrarOpciones();
    if (rutina) {
      // Un pequeño retraso para que el modal se cierre antes de abrir la alerta
      setTimeout(() => {
        this.confirmarBorrar(rutina);
      }, 350);
    }
  }

  async confirmarBorrar(rutina: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: `Se eliminará permanentemente ${rutina.esPlantilla ? 'esta plantilla' : 'este plan asignado'}.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Borrar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Borrando...' });
            await loading.present();
            try {
              await this.coachService.eliminarRutina(rutina.id);
              this.mostrarToast('Eliminado correctamente 🗑️', 'success');
              this.cargarRutinas(); 
            } catch (error) {
              this.mostrarToast('Error al borrar', 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, color });
    toast.present();
  }

  regresar() {
    this.navCtrl.back();
  }
}