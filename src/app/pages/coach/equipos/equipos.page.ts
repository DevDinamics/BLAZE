import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  IonContent, IonIcon, IonSpinner, IonModal, 
  NavController, ToastController, LoadingController 
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth';
import { CoachService } from 'src/app/services/coach';
import { addIcons } from 'ionicons';
import { 
  arrowBack, people, add, trash, shareSocial, lockClosed, star, 
  ellipsisVertical, alertCircle, checkmarkCircle, 
  copyOutline, shareSocialOutline, keyOutline,
  rocketOutline, closeOutline, createOutline, trashOutline, warning
} from 'ionicons/icons';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.page.html',
  styleUrls: ['./equipos.page.scss'],
  standalone: true,
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
  
  mostrarModalOpciones = false;
  equipoSeleccionado: any = null;

  // 👇 Variables para los nuevos Modales Premium
  mostrarModalFormEquipo = false;
  modoFormEquipo: 'crear' | 'editar' = 'crear';
  tempEquipo = { id: '', nombre: '', desc: '' };

  mostrarModalBorrar = false;
  equipoParaBorrar: any = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private coachService: CoachService
  ) {
    addIcons({ 
      arrowBack, people, add, trash, shareSocial, lockClosed, star, 
      ellipsisVertical, alertCircle, checkmarkCircle,
      copyOutline, shareSocialOutline, keyOutline,
      rocketOutline, closeOutline, createOutline, trashOutline, warning
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

  // ── MODAL FORMULARIO: CREAR / EDITAR ──
  async crearNuevoEquipo() {
    if (this.equipos.length >= this.miPlan.maxEquipos) {
      this.mostrarModalPro = true;
      return;
    }
    this.modoFormEquipo = 'crear';
    this.tempEquipo = { id: '', nombre: '', desc: '' };
    this.mostrarModalFormEquipo = true;
  }

  editarNombreEquipo() {
    const equipo = this.equipoSeleccionado;
    this.mostrarModalOpciones = false;
    if (equipo) {
      setTimeout(() => {
        this.modoFormEquipo = 'editar';
        this.tempEquipo = { id: equipo.id, nombre: equipo.nombre, desc: equipo.descripcion || '' };
        this.mostrarModalFormEquipo = true;
      }, 350);
    }
  }

  cerrarModalFormEquipo() {
    this.mostrarModalFormEquipo = false;
  }

  async confirmarFormEquipo() {
    if (!this.tempEquipo.nombre.trim()) {
      this.mostrarToast('Por favor escribe un nombre.', 'danger');
      return;
    }
    
    this.cerrarModalFormEquipo();

    if (this.modoFormEquipo === 'crear') {
      await this.guardarEquipoEnNube(this.tempEquipo.nombre, this.tempEquipo.desc);
    } else {
      await this.coachService.actualizarEquipo(this.tempEquipo.id, this.tempEquipo.nombre);
      this.mostrarToast('Nombre actualizado con éxito', 'success');
      this.cargarPerfilYEquipos();
    }
  }

  async guardarEquipoEnNube(nombre: string, desc: string) {
    if (!this.uidCoach) return;
    const loading = await this.loadingCtrl.create({ message: 'Creando equipo...', mode: 'ios' });
    await loading.present();

    try {
      await this.coachService.crearEquipo(nombre, this.uidCoach, this.miPlan.tipo);
      await this.cargarPerfilYEquipos();
      this.mostrarToast('Equipo creado con éxito', 'success');
    } catch (error) {
      console.error(error);
      this.mostrarToast('Error al crear equipo', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // ── MODAL OPCIONES ──
  opcionesEquipo(equipo: any) {
    this.equipoSeleccionado = equipo;
    this.mostrarModalOpciones = true;
  }

  cerrarOpciones() {
    this.mostrarModalOpciones = false;
    setTimeout(() => {
      if (!this.mostrarModalOpciones) this.equipoSeleccionado = null;
    }, 400);
  }

  // ── MODAL ELIMINAR (PELIGRO) ──
  iniciarBorradoEquipo() {
    const equipo = this.equipoSeleccionado;
    if (equipo) {
      this.confirmarBorrar(equipo);
    }
  }

  async confirmarBorrar(equipo: any) {
    if (!equipo || !equipo.id) {
      this.mostrarToast('Error: El equipo no tiene ID', 'danger');
      return;
    }
    this.mostrarModalOpciones = false; 
    this.equipoParaBorrar = equipo;
    
    setTimeout(() => {
      this.mostrarModalBorrar = true;
    }, 350);
  }

  cerrarModalBorrar() {
    this.mostrarModalBorrar = false;
    this.equipoParaBorrar = null;
  }

  async confirmarBorradoReal() {
    const equipo = this.equipoParaBorrar;
    this.cerrarModalBorrar();
    if (!equipo) return;

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

  async copiarCodigo(codigo: string) {
    await navigator.clipboard.writeText(codigo);
    this.mostrarToast('Código copiado al portapapeles', 'warning');
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