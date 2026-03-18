import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';       
import { StudentService } from 'src/app/services/student'; 
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, qrCodeOutline, happyOutline, calendarOutline, 
  mailOutline, giftOutline, personOutline, starOutline, 
  scaleOutline, bodyOutline, fitnessOutline, informationCircleOutline,
  flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {

  editando = false;
  cargando = true;
  uidUsuario: string | null = null;
  tabActual: string = 'personal';

  usuario: any = {
    nombre: '',
    apellido: '', 
    avatar: 'assets/icon/avatar-h-1.png', // Por defecto
    miembroDesde: '',
    peso: 0,
    altura: 0,
    totalEntrenos: 0,
    rachaActual: 0,
    objetivo: 'Perder peso',      
    experiencia: 'Principiante'
  };

  // 👇 1. Variables para el Modal de Avatares del Alumno
  mostrarModalAvatares = false;
  
  // 👇 2. Lista de Avatares (Usa las rutas de tus assets)
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
    private authService: AuthService,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      checkmarkCircle, qrCodeOutline, happyOutline, calendarOutline, 
      mailOutline, giftOutline, personOutline, starOutline, 
      scaleOutline, bodyOutline, fitnessOutline, informationCircleOutline, 
      flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.uidUsuario = user.uid;
        await this.cargarDatosPerfil(user.uid);
      }
    });
  }

  async cargarDatosPerfil(uid: string) {
    try {
      const datos: any = await this.studentService.obtenerMiPerfil(uid);
      if (datos) {
        this.usuario = {
          nombre: datos.nombre || 'Atleta',
          apellido: datos.apellido || 'Blaze', 
          // Tomamos la foto de Firebase si existe, si no, una por defecto
          avatar: datos.foto || 'assets/icon/avatar-h-1.png', 
          miembroDesde: datos.fechaRegistro ? this.formatearFecha(datos.fechaRegistro) : 'Ene 2026',
          peso: datos.peso || 0,
          altura: datos.altura || 0,
          totalEntrenos: datos.entrenamientosCompletados || 0,
          rachaActual: datos.racha || 0,
          objetivo: datos.objetivo || 'Perder peso',       
          experiencia: datos.experiencia || 'Principiante'
        };
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  // 👇 3. Lógica para abrir el modal (solo se puede si están en modo edición)
  abrirModalFoto() {
    if(this.editando) {
      this.mostrarModalAvatares = true;
    }
  }

  // 👇 4. Seleccionar Avatar
  seleccionarAvatar(avatar: string) {
    this.usuario.avatar = avatar; // Actualiza la vista previa
    this.mostrarModalAvatares = false; // Cierra el modal
  }

  alternarEdicion() {
    if (this.editando) {
      this.guardarCambios();
    } else {
      this.editando = true;
    }
  }

  async guardarCambios() {
    if (!this.uidUsuario) return;
    const loading = await this.loadingCtrl.create({ message: 'Guardando...', spinner: 'crescent' });
    await loading.present();

    try {
      const datosActualizar = {
        peso: Number(this.usuario.peso),
        altura: Number(this.usuario.altura),
        foto: this.usuario.avatar,
        objetivo: this.usuario.objetivo,       // 👈 Guardamos en Firebase
        experiencia: this.usuario.experiencia // Guardamos el nuevo avatar en la BD
      };

      await this.studentService.actualizarPerfil(this.uidUsuario, datosActualizar);
      this.mostrarToast('Perfil actualizado con éxito', 'success');
      this.editando = false; 
    } catch (error) {
      this.mostrarToast('Error al actualizar', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  formatearFecha(timestamp: any) {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }

  async mostrarToast(msj: string, color: string) {
    const t = await this.toastCtrl.create({ message: msj, duration: 2000, color, mode: 'ios' });
    t.present();
  }

  get bmi() {
    if (!this.usuario.peso || !this.usuario.altura) return 0;
    return parseFloat((this.usuario.peso / (this.usuario.altura * this.usuario.altura)).toFixed(1));
  }

  get imcEstado(): string {
    const imc = this.bmi;
    if (imc < 18.5) return 'Bajo Peso';
    if (imc >= 18.5 && imc < 24.9) return 'Saludable';
    if (imc >= 25 && imc < 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  get imcColor(): string {
    const imc = this.bmi;
    if (imc < 18.5) return 'bg-blue-400';
    if (imc >= 18.5 && imc < 24.9) return 'bg-green-500';
    if (imc >= 25 && imc < 29.9) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  get imcTextColor(): string {
    const imc = this.bmi;
    if (imc < 18.5) return 'text-blue-500';
    if (imc >= 18.5 && imc < 24.9) return 'text-green-600';
    if (imc >= 25 && imc < 29.9) return 'text-yellow-600';
    return 'text-red-500';
  }
}