import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';

import { AuthService } from 'src/app/services/auth';
import { CoachService } from 'src/app/services/coach';

// 👇 Íconos limpios (outline) para el modo claro
import { 
  arrowBack, cameraOutline, briefcaseOutline, schoolOutline, ribbonOutline, timeOutline, 
  lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, logOutOutline, trashOutline, 
  settingsOutline, checkmarkCircle, checkmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil-coach',
  templateUrl: './perfil-coach.page.html',
  styleUrls: ['./perfil-coach.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilCoachPage implements OnInit {

  uidCoach: string = '';
  cargando = true;

  // 👇 Control de UI similar al alumno
  editando = false;
  tabActual: string = 'personal';

  coach = {
    nombre: '',
    apellido: '',
    titulo: '',
    especialidad: '',
    experiencia: '',
    certificaciones: '',
    bio: '',
    foto: 'assets/avatar.png' 
  };

  passwords = { actual: '', nueva: '', confirmar: '' };
  mostrarPass = false;

  mostrarModalAvatares = false;
  
  avataresDisponibles = [
    'assets/avatar-coach/avatar-hombre-1.png',
    'assets/avatar-coach/avatar-hombre-2.png',
    'assets/avatar-coach/avatar-hombre-3.png',
    'assets/avatar-coach/avatar-mujer-1.png',
    'assets/avatar-coach/avatar-mujer-2.png',
    'assets/avatar-coach/avatar-mujer-3.png'
  ];

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private coachService: CoachService
  ) {
    addIcons({ 
      arrowBack, cameraOutline, briefcaseOutline, schoolOutline, ribbonOutline, timeOutline, 
      lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, logOutOutline, trashOutline, 
      settingsOutline, checkmarkCircle, checkmarkOutline
    });
  }

  async ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.uidCoach = user.uid;
        await this.cargarDatos();
      }
    });
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const datos: any = await this.coachService.obtenerMiPerfilCoach(this.uidCoach);
      if (datos) {
        this.coach = {
          nombre: datos.nombre || 'Instructor',
          apellido: datos.apellido || 'Pro',
          titulo: datos.cargo || datos.titulo || 'Entrenador Personal',
          especialidad: datos.especialidad || '',
          experiencia: datos.experiencia || '',
          certificaciones: datos.credenciales || datos.certificaciones || '',
          bio: datos.bio || '',
          foto: datos.foto || 'assets/avatar-coach/avatar-hombre-1.png'
        };
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      this.cargando = false;
    }
  }

  // 👇 Alternar entre ver y editar
  alternarEdicion() {
    if (this.editando) {
      this.guardarPerfil();
    } else {
      this.editando = true;
    }
  }

  abrirModalFoto() {
    if (this.editando) {
      this.mostrarModalAvatares = true;
    }
  }

  seleccionarAvatar(avatar: string) {
    this.coach.foto = avatar; 
    this.mostrarModalAvatares = false; 
  }

  async guardarPerfil() {
    if (!this.uidCoach) return;
    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();

    try {
      await this.coachService.actualizarPerfilCoach(this.uidCoach, this.coach);
      this.mostrarToast('¡Perfil actualizado exitosamente! 🚀', 'success');
      this.editando = false; // Cerramos modo edición
    } catch (error) {
      this.mostrarToast('Error al guardar. Intenta de nuevo.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  regresar() { this.navCtrl.back(); }
  togglePass() { this.mostrarPass = !this.mostrarPass; }

  async cambiarPassword() {
    if (!this.passwords.actual || !this.passwords.nueva || !this.passwords.confirmar) {
      this.mostrarToast('Llena todos los campos de contraseña ⚠️', 'warning');
      return;
    }
    if (this.passwords.nueva !== this.passwords.confirmar) {
      this.mostrarToast('Las contraseñas nuevas no coinciden ❌', 'danger');
      return;
    }
    this.mostrarToast('Contraseña actualizada (Simulado) 🔒', 'success');
    this.passwords = { actual: '', nueva: '', confirmar: '' }; 
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'top', mode: 'ios' });
    toast.present();
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }

  async confirmarEliminarCuenta() {
    const alert = await this.alertCtrl.create({
      header: '¿Deseas ELIMINAR tu cuenta?',
      message: 'Esta acción es irreversible y eliminará todos tus equipos y rutinas.',
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'text-gray-500 font-bold' },
        { text: 'Eliminar Cuenta', role: 'destructive', cssClass: 'text-red-500 font-black', handler: () => this.ejecutarEliminacion() }
      ]
    });
    await alert.present();
  }

  async ejecutarEliminacion() {
    const loading = await this.loadingCtrl.create({ message: 'Procesando baja...', mode: 'ios' });
    await loading.present();
    try {
      this.mostrarToast('Tu cuenta ha sido programada para eliminación.', 'success');
      setTimeout(async () => {
        await this.authService.logout();
        this.navCtrl.navigateRoot('/login');
      }, 1500);
    } catch (error) {
      this.mostrarToast('Error al intentar eliminar la cuenta.', 'danger');
    } finally {
      loading.dismiss();
    }
  }
}