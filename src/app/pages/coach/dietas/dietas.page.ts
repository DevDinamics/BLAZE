import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, NavController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';

// 👇 Íconos limpios (Outline) + ellipsisVertical para el menú
import { 
  arrowBackOutline, addOutline, restaurantOutline, flameOutline, waterOutline, 
  trashOutline, createOutline, personAddOutline, personOutline, documentTextOutline,
  folderOpenOutline, ellipsisVertical, copyOutline
} from 'ionicons/icons';

// 👇 Agregamos deleteDoc y doc para poder borrar
import { Firestore, collection, query, where, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dietas',
  templateUrl: './dietas.page.html',
  styleUrls: ['./dietas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DietasPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  private router = inject(Router);
  
  coachActual: any = null;
  suscripcionAuth: Subscription | null = null;
  cargando = true;

  vistaActual: 'asignadas' | 'plantillas' = 'asignadas';
  asignadas: any[] = [];
  plantillas: any[] = [];

  // ==========================================
  // 👇 VARIABLES PARA EL MODAL DE OPCIONES
  // ==========================================
  mostrarModalOpciones = false;
  dietaSeleccionada: any = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      arrowBackOutline, addOutline, restaurantOutline, flameOutline, waterOutline, 
      trashOutline, createOutline, personAddOutline, personOutline, documentTextOutline,
      folderOpenOutline, ellipsisVertical, copyOutline
    });
  }

  ngOnInit() {
    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.coachActual = user;
        this.cargarDietas(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe();
  }

  async cargarDietas(coachId: string) {
    this.cargando = true;
    try {
      const qAlumnos = query(collection(this.firestore, 'usuarios'), where('coachId', '==', coachId), where('rol', '==', 'alumno'));
      const snapAlumnos = await getDocs(qAlumnos);
      
      const mapaAlumnos: { [key: string]: string } = {};
      snapAlumnos.forEach(doc => {
        mapaAlumnos[doc.id] = doc.data()['nombre'];
      });

      const qDietas = query(collection(this.firestore, 'dietas'), where('coachId', '==', coachId));
      const snapDietas = await getDocs(qDietas);
      
      const tempAsignadas: any[] = [];
      const tempPlantillas: any[] = [];

      snapDietas.forEach(docSnap => {
        const d = docSnap.data();
        const dietaEstructurada = {
          id: docSnap.id,
          nombre: d['nombrePlan'],
          objetivo: d['objetivo'],
          calorias: d['metas']?.calorias || 0,
          comidasCount: d['comidas'] ? d['comidas'].length : 0,
          alumnoId: d['alumnoId'],
          alumnoNombre: mapaAlumnos[d['alumnoId']] || 'Desconocido', 
          esPlantilla: d['esPlantilla'] === true,
          activa: d['activa'],
          rawDoc: d
        };

        if (dietaEstructurada.esPlantilla) {
          tempPlantillas.push(dietaEstructurada);
        } else if (dietaEstructurada.activa) { 
          tempAsignadas.push(dietaEstructurada);
        }
      });

      this.asignadas = tempAsignadas;
      this.plantillas = tempPlantillas;

    } catch (error) {
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  regresar() { this.navCtrl.back(); }

  cambiarVista(vista: 'asignadas' | 'plantillas') {
    this.vistaActual = vista;
  }

  // ==========================================
  // 🟢 LÓGICA DEL MENÚ DE OPCIONES
  // ==========================================

  abrirOpciones(dieta: any) {
    this.dietaSeleccionada = dieta;
    this.mostrarModalOpciones = true;
  }

  cerrarOpciones() {
    this.mostrarModalOpciones = false;
    setTimeout(() => this.dietaSeleccionada = null, 300); // Limpiamos después de la animación
  }

  usarPlantilla(dieta: any) {
    this.router.navigate(['/coach/crear-dieta'], { state: { plantilla: dieta } });
  }

  editarDieta() {
    const dieta = this.dietaSeleccionada;
    this.cerrarOpciones();
    if (dieta) {
      // Enviamos la dieta al creador en modo "edición"
      this.router.navigate(['/coach/crear-dieta'], { 
        state: { 
          plantilla: dieta,
          esEdicion: true 
        } 
      });
    }
  }

  iniciarBorrado() {
    const dieta = this.dietaSeleccionada;
    this.cerrarOpciones();
    if (dieta) {
      setTimeout(() => {
        this.confirmarBorrar(dieta);
      }, 350);
    }
  }

  async confirmarBorrar(dieta: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar Plan?',
      message: `Se eliminará permanentemente ${dieta.esPlantilla ? 'esta plantilla' : 'este plan asignado'}.`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Borrar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Borrando...', mode: 'ios' });
            await loading.present();
            try {
              // 👇 Borramos el documento de Firebase
              await deleteDoc(doc(this.firestore, 'dietas', dieta.id));
              
              const toast = await this.toastCtrl.create({ message: 'Eliminado correctamente 🗑️', duration: 2000, color: 'success', mode: 'ios' });
              toast.present();
              
              // Recargamos la lista
              this.cargarDietas(this.coachActual.uid); 
            } catch (error) {
              const toast = await this.toastCtrl.create({ message: 'Error al borrar', duration: 2000, color: 'danger', mode: 'ios' });
              toast.present();
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}