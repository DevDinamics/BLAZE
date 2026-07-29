import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  IonContent, IonIcon, IonModal, 
  NavController, ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth';       
import { StudentService } from 'src/app/services/student'; 
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, qrCodeOutline, happyOutline, calendarOutline, 
  mailOutline, giftOutline, personOutline, starOutline, 
  scaleOutline, bodyOutline, fitnessOutline, informationCircleOutline,
  flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline,
  chevronDownOutline, warning, checkmark 
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonModal]
})
export class PerfilPage implements OnInit {

  editando = false;
  cargando = true;
  uidUsuario: string | null = null;
  tabActual: string = 'personal';

  // 🛡️ Bindings directos para producción
  iconCamera = cameraOutline;
  iconCheckmarkCircle = checkmarkCircle;
  iconHappy = happyOutline;
  iconCalendar = calendarOutline;
  iconMail = mailOutline;
  iconGift = giftOutline;
  iconPerson = personOutline;
  iconScale = scaleOutline;
  iconBody = bodyOutline;
  iconFitness = fitnessOutline;
  iconLogOut = logOutOutline;
  iconChevronDown = chevronDownOutline;
  iconFlame = flame;
  iconBarbell = barbellOutline;
  iconCheckmarkOutline = checkmarkOutline;
  iconCheckmark = checkmark;
  iconWarning = warning;

  usuario: any = {
    nombre: '',
    apellido: '', 
    email: '',
    bio: '', 
    avatar: 'assets/icon/avatar-h-1.png', 
    miembroDesde: '',
    fechaNacimientoFormateada: '',
    edad: 0,
    peso: 0,
    altura: 0,
    totalEntrenos: 0,
    rachaActual: 0,
    objetivo: 'Perder peso',      
    experiencia: 'Principiante',
    lesiones: ''
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

  modalMenuAbierto = false;
  menuTitulo = '';
  menuCampoTarget = ''; 
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

  modalAlertaAbierto = false;
  accionPendiente: 'logout' | 'navegacion' | 'none' = 'none';
  resolveSalida: ((value: boolean) => void) | null = null; 

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      'camera-outline': cameraOutline,
      'checkmark-circle': checkmarkCircle,
      'happy-outline': happyOutline,
      'calendar-outline': calendarOutline,
      'mail-outline': mailOutline,
      'gift-outline': giftOutline,
      'person-outline': personOutline,
      'scale-outline': scaleOutline,
      'body-outline': bodyOutline,
      'fitness-outline': fitnessOutline,
      'log-out-outline': logOutOutline,
      'chevron-down-outline': chevronDownOutline,
      'barbell-outline': barbellOutline,
      'checkmark-outline': checkmarkOutline,
      checkmarkCircle, qrCodeOutline, happyOutline, calendarOutline, 
      mailOutline, giftOutline, personOutline, starOutline, 
      scaleOutline, bodyOutline, fitnessOutline, informationCircleOutline, 
      flame, barbellOutline, cameraOutline, logOutOutline, checkmarkOutline,
      warning, checkmark
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
          email: datos.email || 'armando.delgado1@ukuepa.com',
          bio: datos.bio || '', 
          avatar: datos.foto || 'assets/icon/avatar-h-1.png', 
          miembroDesde: datos.fechaRegistro ? this.formatearFecha(datos.fechaRegistro) : 'Ene 2026',
          fechaNacimientoFormateada: datos.fechaNacimiento ? this.formatearFechaCompleta(datos.fechaNacimiento) : '8 de octubre de 1998',
          edad: datos.edad || 26,
          peso: datos.peso || 0,
          altura: datos.altura || 0,
          totalEntrenos: datos.entrenamientosCompletados || 0,
          rachaActual: datos.racha || 0,
          objetivo: datos.objetivo || 'Perder peso',       
          experiencia: datos.experiencia || 'Principiante',
          lesiones: datos.lesiones || ''
        };
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

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

  formatearFechaCompleta(timestamp: any) {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async ionViewCanLeave(): Promise<boolean> {
    if (this.editando) {
      this.accionPendiente = 'navegacion';
      this.modalAlertaAbierto = true; 
      return new Promise((resolve) => {
        this.resolveSalida = resolve; 
      });
    }
    return true; 
  }

  intentarCerrarSesion() {
    if (this.editando) {
      this.accionPendiente = 'logout';
      this.modalAlertaAbierto = true;
    } else {
      this.ejecutarLogout();
    }
  }

  confirmarSalida() {
    this.modalAlertaAbierto = false;
    this.editando = false;
    
    setTimeout(() => {
      if (this.accionPendiente === 'logout') {
        this.ejecutarLogout();
      } else if (this.accionPendiente === 'navegacion' && this.resolveSalida) {
        this.resolveSalida(true); 
      }
      this.limpiarEstadoAlerta();
    }, 300);
  }

  cancelarSalida() {
    this.modalAlertaAbierto = false;
    
    setTimeout(() => {
      if (this.accionPendiente === 'navegacion' && this.resolveSalida) {
        this.resolveSalida(false); 
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
    
    let alturaMetros = this.usuario.altura;
    if (alturaMetros > 3) {
      alturaMetros = alturaMetros / 100;
    }

    return parseFloat((this.usuario.peso / (alturaMetros * alturaMetros)).toFixed(1));
  }

  get imcEstado(): string {
    const imc = this.bmi;
    if (imc === 0) return 'N/A';
    if (imc < 18.5) return 'Bajo Peso';
    if (imc >= 18.5 && imc < 24.9) return 'Saludable';
    if (imc >= 25 && imc < 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  get imcColor(): string {
    const imc = this.bmi;
    if (imc === 0) return 'bg-gray-300';
    if (imc < 18.5) return 'bg-blue-400';
    if (imc >= 18.5 && imc < 24.9) return 'bg-green-500';
    if (imc >= 25 && imc < 29.9) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  get imcTextColor(): string {
    const imc = this.bmi;
    if (imc === 0) return 'text-gray-400';
    if (imc < 18.5) return 'text-blue-500';
    if (imc >= 18.5 && imc < 24.9) return 'text-green-600';
    if (imc >= 25 && imc < 29.9) return 'text-yellow-600';
    return 'text-red-500';
  }
}