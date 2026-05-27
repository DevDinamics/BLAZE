import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 👇 FIX MÁGICO: Importamos TODO desde standalone. 
// Esto asegura que los controladores sobrevivan al empaquetado de Producción.
import { 
  IonContent, IonIcon, IonSpinner, IonModal,
  NavController, ToastController, AlertController, LoadingController, ActionSheetController 
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth';
import { CoachService } from 'src/app/services/coach';
import { addIcons } from 'ionicons';
import { 
  arrowBack, people, add, trash, shareSocial, lockClosed, star, 
  ellipsisVertical, alertCircle, checkmarkCircle, 
  copyOutline, shareSocialOutline, keyOutline,
  rocketOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.page.html',
  styleUrls: ['./equipos.page.scss'],
  standalone: true,
  // 👇 FIX: Declaramos los módulos de UI de Ionic explícitamente aquí
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner, IonModal]
})
export class EquiposPage implements OnInit {

  uidCoach: string | null = null;
  
  miPlan = {
    nombre: 'Plan Starter', 
    tipo: 'starter',
    maxEquipos: 1, 
    maxMiembrosPorEquipo: 5
  };

  equipos: any[] = [];
  cargando = true;

  mostrarModalPro = false;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private authService: AuthService,
    private coachService: CoachService
  ) {
    addIcons({ 
      arrowBack, people, add, trash, shareSocial, lockClosed, star, 
      ellipsisVertical, alertCircle, checkmarkCircle,
      copyOutline, shareSocialOutline, keyOutline,
      rocketOutline, closeOutline 
    });
  }

  async ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.uidCoach = user.uid;
        await this.cargarPerfilYEquipos();
      }
    });
  }

  async cargarPerfilYEquipos() {
    if (!this.uidCoach) return;
    this.cargando = true;
    try {
      this.equipos = await this.coachService.obtenerMisEquipos(this.uidCoach);
    } catch (error) {
      console.error('Error cargando equipos', error);
    } finally {
      this.cargando = false;
    }
  }

  regresar() {
    this.navCtrl.back();
  }

  async crearNuevoEquipo() {
    if (this.equipos.length >= this.miPlan.maxEquipos) {
      this.mostrarModalPro = true;
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Nuevo Equipo',
      cssClass: 'alert-pill',
      mode: 'ios', // 👈 Forzamos el estilo premium
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (Ej: Team Hipertrofia)' },
        { name: 'desc', type: 'text', placeholder: 'Descripción corta' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (data.nombre) this.guardarEquipoEnNube(data.nombre, data.desc);
          }
        }
      ]
    });
    await alert.present();
  }

  async guardarEquipoEnNube(nombre: string, desc: string) {
    if (!this.uidCoach) return;
    const loading = await this.loadingCtrl.create({ message: 'Creando equipo...', mode: 'ios' });
    await loading.present();

    try {
      await this.coachService.crearEquipo(nombre, this.uidCoach, this.miPlan.tipo);
      await this.cargarPerfilYEquipos();
      this.mostrarToast('Equipo creado con exito', 'success');
    } catch (error) {
      console.error(error);
      this.mostrarToast('Error al crear equipo', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async opcionesEquipo(equipo: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: equipo.nombre,
      mode: 'ios', // 👈 Forzamos el estilo premium
      buttons: [
        {
          text: 'Editar Nombre',
          handler: () => {
            actionSheet.onDidDismiss().then(() => {
              this.alertEditar(equipo);
            });
          }
        },
        {
          text: 'Eliminar Equipo',
          role: 'destructive',
          handler: () => {
            actionSheet.onDidDismiss().then(() => {
              this.confirmarBorrar(equipo);
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async alertEditar(equipo: any) {
    const alert = await this.alertCtrl.create({
      header: 'Renombrar Equipo',
      cssClass: 'alert-pill',
      mode: 'ios',
      inputs: [
        { name: 'nombre', type: 'text', value: equipo.nombre, placeholder: 'Nuevo nombre' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.nombre) {
              await this.coachService.actualizarEquipo(equipo.id, data.nombre);
              this.mostrarToast('Nombre actualizado', 'success');
              this.cargarPerfilYEquipos();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmarBorrar(equipo: any) {
    if (!equipo || !equipo.id) {
      this.mostrarToast('Error: El equipo no tiene ID', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar Equipo',
      cssClass: 'alert-pill',
      mode: 'ios',
      message: `Se eliminara el equipo "${equipo.nombre.toUpperCase()}" y se expulsara a todos sus miembros.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Eliminando...', mode: 'ios' });
            await loading.present();
            
            try {
              await this.coachService.eliminarEquipo(equipo.id, equipo.miembros || []);
              this.mostrarToast('Equipo eliminado', 'warning');
              await this.cargarPerfilYEquipos();
            } catch (error) {
              console.error('Error al borrar:', error);
              this.mostrarToast('Error al eliminar', 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async copiarCodigo(codigo: string) {
    await navigator.clipboard.writeText(codigo);
    this.mostrarToast('Codigo copiado al portapapeles', 'warning');
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 1500,
      color: color,
      position: 'top',
      mode: 'ios',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }
}