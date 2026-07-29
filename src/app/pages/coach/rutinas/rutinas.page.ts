import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { 
  IonContent, IonIcon, IonModal, IonSpinner,
  NavController, AlertController, LoadingController, ToastController 
} from '@ionic/angular/standalone';

import { CoachService } from 'src/app/services/coach';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import { addIcons } from 'ionicons';
import { 
  add, timeOutline, layersOutline, chevronForward, barbell, arrowBack, copy, 
  person, trash, create, close, search, documentTextOutline, folderOpenOutline, 
  personOutline, copyOutline, ellipsisVertical, createOutline, trashOutline 
} from 'ionicons/icons'; 

@Component({
  selector: 'app-rutinas',
  templateUrl: './rutinas.page.html',
  styleUrls: ['./rutinas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonIcon, IonModal, IonSpinner
  ]
})
export class RutinasPage { 

  segmento: string = 'activas'; 
  rutinasActivas: any[] = [];
  misPlantillas: any[] = [];
  cargando = true;

  mostrarModalOpciones = false;
  rutinaSeleccionada: any = null;

  // 🛡️ Bindings de iconos para AOT
  iconAdd = add;
  iconArrowBack = arrowBack;
  iconEllipsis = ellipsisVertical;
  iconDocumentText = documentTextOutline;
  iconFolderOpen = folderOpenOutline;
  iconCopy = copyOutline;
  iconLayers = layersOutline;
  iconCreate = createOutline;
  iconTrash = trashOutline;

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

            // ⚡ OBTENER NOMBRE Y FOTO REAL DEL ALUMNO + TOTAL DE EJERCICIOS
            for (let rutina of this.rutinasActivas) {
              
              // 1. Calcular total de ejercicios
              let totalEj = 0;
              if (rutina.sesiones && Array.isArray(rutina.sesiones)) {
                rutina.sesiones.forEach((s: any) => {
                  if (s.ejercicios && Array.isArray(s.ejercicios)) {
                    totalEj += s.ejercicios.length;
                  }
                });
              }
              rutina.totalEjercicios = totalEj;

              // 2. Traer datos del alumno si tiene un ID asignado
              if (rutina.alumnoId) { 
                try {
                  const alumnoRef = doc(this.firestore, `usuarios/${rutina.alumnoId}`);
                  const alumnoSnap = await getDoc(alumnoRef);
                  
                  if (alumnoSnap.exists()) {
                    const datosAlumno = alumnoSnap.data();
                    const nombre = datosAlumno['nombre'] || '';
                    const apellido = datosAlumno['apellido'] || '';
                    
                    // 🎯 GUARDAMOS EL NOMBRE Y LA FOTO
                    rutina.nombreAlumno = `${nombre} ${apellido}`.trim() || 'Atleta BLAZE';
                    rutina.fotoAlumno = datosAlumno['foto'] || 'assets/avatar-h-1.png';
                  }
                } catch (e) {
                  console.error('Error buscando datos del alumno:', e);
                }
              }
            }

            // Mismo cálculo de ejercicios para las plantillas
            for (let plan of this.misPlantillas) {
              let totalEj = 0;
              if (plan.sesiones && Array.isArray(plan.sesiones)) {
                plan.sesiones.forEach((s: any) => {
                  if (s.ejercicios && Array.isArray(s.ejercicios)) {
                    totalEj += s.ejercicios.length;
                  }
                });
              }
              plan.totalEjercicios = totalEj;
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
      this.navCtrl.navigateForward(['/coach/crear-rutina'], { queryParams: { modo: 'plantilla' } });
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
    setTimeout(() => {
      if (!this.mostrarModalOpciones) {
        this.rutinaSeleccionada = null;
      }
    }, 400); 
  }

  editarRutina() {
    const id = this.rutinaSeleccionada?.id;
    const esPlantilla = this.rutinaSeleccionada?.esPlantilla;
    this.mostrarModalOpciones = false;
    
    if (id) {
      setTimeout(() => {
        if (esPlantilla) {
          this.navCtrl.navigateForward([`/coach/crear-rutina/${id}`], { queryParams: { modo: 'plantilla' } });
        } else {
          this.navCtrl.navigateForward([`/coach/crear-rutina/${id}`]);
        }
      }, 350);
    }
  }

  async iniciarBorrado() {
    const rutina = this.rutinaSeleccionada;
    if (rutina) {
      await this.confirmarBorrar(rutina);
    }
  }

  async confirmarBorrar(rutina: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: `Se eliminará permanentemente ${rutina.esPlantilla ? 'esta plantilla' : 'este plan asignado'}.`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Borrar',
          handler: async () => {
            this.mostrarModalOpciones = false; 
            const loading = await this.loadingCtrl.create({ message: 'Borrando...', mode: 'ios' });
            await loading.present();
            
            try {
              await this.coachService.eliminarRutina(rutina.id);
              this.mostrarToast('Eliminado correctamente', 'success');
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