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
  flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline,
  chevronDownOutline, warning, checkmark // Nuevos íconos
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
    bio: '', 
    avatar: 'assets/icon/avatar-h-1.png', 
    miembroDesde: '',
    peso: 0,
    altura: 0,
    totalEntrenos: 0,
    rachaActual: 0,
    objetivo: 'Perder peso',      
    experiencia: 'Principiante'
  };

  mostrarModalAvatares = false;
  
  avataresDisponibles = [
    'assets/avatar-coach/avatar-hombre-1.png',
    'assets/avatar-coach/avatar-hombre-2.png',
    'assets/avatar-coach/avatar-hombre-3.png',
    'assets/avatar-coach/avatar-mujer-1.png',
    'assets/avatar-coach/avatar-mujer-2.png',
    'assets/avatar-coach/avatar-mujer-3.png'
  ];

  // ==========================================
  // 👇 1. VARIABLES DEL SELECTOR PREMIUM
  // ==========================================
  modalMenuAbierto = false;
  menuTitulo = '';
  menuCampoTarget = ''; // Para saber si estamos editando 'objetivo' o 'experiencia'
  menuOpciones: any[] = [];

  opcionesObjetivo = [
    { label: 'Perder peso', value: 'Perder peso' },
    { label: 'Aumentar músculo', value: 'Aumentar músculo' },
    { label: 'Recomposición (Mantener)', value: 'Recomposición' },
    { label: 'Mejorar Rendimiento', value: 'Rendimiento' }
  ];

  opcionesExperiencia = [
    { label: 'Principiante', value: 'Principiante' },
    { label: 'Intermedio', value: 'Intermedio' },
    { label: 'Avanzado', value: 'Avanzado' }
  ];

  // ==========================================
  // 👇 2. VARIABLES DE LA ALERTA PROTECTORA
  // ==========================================
  modalAlertaAbierto = false;
  accionPendiente: 'logout' | 'navegacion' | 'none' = 'none';
  resolveSalida: ((value: boolean) => void) | null = null; // 👈 Guarda la "llave" de la navegación

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
      flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline,
      'chevron-down-outline': chevronDownOutline, warning, checkmark
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
          bio: datos.bio || '', 
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

  // ==========================================
  // MÉTODOS DEL SELECTOR PREMIUM
  // ==========================================
  abrirMenuOpciones(campo: string, titulo: string, opciones: any[]) {
    this.menuCampoTarget = campo;
    this.menuTitulo = titulo;
    this.menuOpciones = opciones;
    this.modalMenuAbierto = true;
  }

  seleccionarOpcion(valor: string) {
    this.usuario[this.menuCampoTarget] = valor;
    this.modalMenuAbierto = false;
  }

  // ==========================================
  // MÉTODOS GENERALES
  // ==========================================
  abrirModalFoto() {
    if(this.editando) this.mostrarModalAvatares = true;
  }

  seleccionarAvatar(avatar: string) {
    this.usuario.avatar = avatar; 
    this.mostrarModalAvatares = false; 
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
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        peso: Number(this.usuario.peso),
        altura: Number(this.usuario.altura),
        foto: this.usuario.avatar,
        bio: this.usuario.bio, 
        objetivo: this.usuario.objetivo,       
        experiencia: this.usuario.experiencia 
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

  // ==========================================
  // 👇 EL ESCUDO PROTECTOR PARA BOTONES Y TABS
  // ==========================================

  // Este es el método que Angular y el Guard van a ejecutar al intentar cambiar de Tab
  async ionViewCanLeave(): Promise<boolean> {
    if (this.editando) {
      this.accionPendiente = 'navegacion';
      this.modalAlertaAbierto = true; // Abre nuestro Modal bonito
      
      // Congelamos la navegación hasta que el usuario decida en el Modal
      return new Promise((resolve) => {
        this.resolveSalida = resolve; 
      });
    }
    return true; // Si no está editando, sale normal al instante
  }

  intentarCerrarSesion() {
    if (this.editando) {
      this.accionPendiente = 'logout';
      this.modalAlertaAbierto = true;
    } else {
      this.ejecutarLogout();
    }
  }

  // Cuando el usuario le da a "Descartar cambios y Salir"
  confirmarSalida() {
    this.modalAlertaAbierto = false;
    this.editando = false;
    
    setTimeout(() => {
      if (this.accionPendiente === 'logout') {
        this.ejecutarLogout();
      } else if (this.accionPendiente === 'navegacion' && this.resolveSalida) {
        this.resolveSalida(true); // Da luz verde a Angular para cambiar de Tab
      }
      this.limpiarEstadoAlerta();
    }, 300);
  }

  // Cuando el usuario le da a "Seguir editando" (Cancelar)
  cancelarSalida() {
    this.modalAlertaAbierto = false;
    
    setTimeout(() => {
      if (this.accionPendiente === 'navegacion' && this.resolveSalida) {
        this.resolveSalida(false); // Bloquea el cambio de Tab, se queda en Perfil
      }
      this.limpiarEstadoAlerta();
    }, 300);
  }

  limpiarEstadoAlerta() {
    this.accionPendiente = 'none';
    this.resolveSalida = null;
  }

  ejecutarLogout() {
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