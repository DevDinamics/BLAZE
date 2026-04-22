import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CoachService } from 'src/app/services/coach';
import { AuthService } from 'src/app/services/auth';

// Herramientas de Firebase
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import { addIcons } from 'ionicons';
import { 
  add, timeOutline, layersOutline, chevronForward, barbell, arrowBack, copy, 
  person, trash, create, close, search, documentTextOutline, folderOpenOutline, 
  personOutline, copyOutline, ellipsisVertical,
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

  mostrarModalOpciones = false;
  rutinaSeleccionada: any = null;

  constructor(
    private firestore: Firestore,
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

            // MAGIA PARA TRAER LOS AVATARES
            for (let rutina of this.rutinasActivas) {
              if (rutina.alumnoId) { 
                try {
                  const alumnoRef = doc(this.firestore, `usuarios/${rutina.alumnoId}`);
                  const alumnoSnap = await getDoc(alumnoRef);
                  
                  if (alumnoSnap.exists()) {
                    rutina.fotoAlumno = alumnoSnap.data()['foto'];
                  }
                } catch (e) {
                  console.error('Error buscando foto del alumno:', e);
                }
              }
            }
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

  abrirOpciones(rutina: any) {
    this.rutinaSeleccionada = rutina;
    this.mostrarModalOpciones = true;
  }

  cerrarOpciones() {
    this.mostrarModalOpciones = false;
    // Damos tiempo a que la animación termine antes de limpiar la variable
    setTimeout(() => {
      if (!this.mostrarModalOpciones) {
        this.rutinaSeleccionada = null;
      }
    }, 400); 
  }

  // 👇 SOLUCIÓN 1: Evitamos chocar con la animación del modal
  editarRutina() {
    const id = this.rutinaSeleccionada?.id;
    this.mostrarModalOpciones = false; // Disparamos el cierre
    
    if (id) {
      // Esperamos 350ms a que el modal se cierre por completo antes de viajar
      setTimeout(() => {
        this.navCtrl.navigateForward(['/coach/crear-rutina', { id: id }]);
      }, 350);
    }
  }

  // 👇 SOLUCIÓN 2: Lanzamos la alerta encima del modal sin cerrarlo primero
  async iniciarBorrado() {
    const rutina = this.rutinaSeleccionada;
    if (rutina) {
      // Directo a la confirmación, sin cerrar el modal todavía
      await this.confirmarBorrar(rutina);
    }
  }

  async confirmarBorrar(rutina: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: `Se eliminará permanentemente ${rutina.esPlantilla ? 'esta plantilla' : 'este plan asignado'}.`,
      mode: 'ios',
      buttons: [
        { 
          text: 'Cancelar', 
          role: 'cancel' 
        },
        {
          text: 'Sí, Borrar',
          handler: async () => {
            // Cerramos el modal ahora que ya confirmaron
            this.mostrarModalOpciones = false; 
            
            const loading = await this.loadingCtrl.create({ message: 'Borrando...', mode: 'ios' });
            await loading.present();
            
            try {
              await this.coachService.eliminarRutina(rutina.id);
              this.mostrarToast('Eliminado correctamente 🗑️', 'success');
              this.cargarRutinas(); 
            } catch (error) {
              console.error('Error al borrar de Firestore:', error);
              this.mostrarToast('Error al borrar de la base de datos', 'danger');
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
    const toast = await this.toastCtrl.create({ 
      message: mensaje, 
      duration: 2500, 
      color: color,
      mode: 'ios',
      position: 'top'
    });
    toast.present();
  }

  regresar() {
    this.navCtrl.back();
  }
}