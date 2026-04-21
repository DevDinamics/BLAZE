import { Component, OnDestroy, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 

import { 
  IonHeader, IonContent, IonIcon, IonSpinner, IonModal, 
  ModalController, LoadingController, ToastController, 
  NavController, AlertController 
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth';
import { StudentService } from 'src/app/services/student';
import { Subscription } from 'rxjs'; 

import { Firestore, collection, query, where, onSnapshot, orderBy } from '@angular/fire/firestore';
import { UploadPreviewPage } from 'src/app/modals/upload-preview/upload-preview.page';
import { StoryViewerPage } from 'src/app/modals/story-viewer/story-viewer.page';
import { VerPerfilCoachComponent } from 'src/app/modals/ver-perfil-coach/ver-perfil-coach.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// 👇 Importamos addIcons para registrar los iconos de la tarjeta de compañero
import { addIcons } from 'ionicons';

import { 
  flameOutline, barbellOutline, addCircleOutline, starOutline, playOutline, 
  timeOutline, listOutline, checkmarkCircleOutline, calendarOutline,
  flashOutline, checkmarkDoneOutline, keyOutline, ticketOutline, logOutOutline, 
  constructOutline, helpCircleOutline, trophyOutline, personOutline, 
  alertCircleOutline, hourglassOutline, apertureOutline, cameraOutline, 
  addOutline, chevronForwardOutline, play, clipboardOutline, moonOutline, sparklesOutline,
  close, personAdd // Nuevos iconos para el modal del team
} from 'ionicons/icons';

@Component({
  selector: 'app-entreno-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, 
    IonHeader, IonContent, IonIcon, IonSpinner, IonModal
  ] 
})
export class EntrenoDashboardPage implements OnDestroy { 

  private firestore = inject(Firestore); 

  iconFlame = flameOutline;
  iconKey = keyOutline;
  iconTicket = ticketOutline;
  iconAdd = addOutline;
  iconChevron = chevronForwardOutline;
  iconAlert = alertCircleOutline;
  iconHourglass = hourglassOutline;
  iconCalendar = calendarOutline;
  iconTime = timeOutline;
  iconPlay = play;
  iconClipboard = clipboardOutline;
  iconTrophy = trophyOutline;
  iconCheckmark = checkmarkDoneOutline;
  iconBarbell = barbellOutline;
  iconConstruct = constructOutline;
  iconMoon = moonOutline;
  iconSparkles = sparklesOutline; 

  perfil: any = null;
  rutinaActual: any = null;
  coachActual: any = null;
  
  codigoInput = '';
  cargando = true;
  mostrarBienvenida = false;
  
  suscripcionPerfil: any; 
  suscripcionStories: any; 
  suscripcionAuth: Subscription | null = null; 
  suscripcionRankingTeam: any; 

  diasRestantes: number | null = null;
  historias: any[] = [];
  rankingTeam: any[] = []; 

  // 👇 Variables para el Diseño Dinámico y Selector de Días
  fechaActualFormateada: string = '';
  sesionHoyTexto: string = '';
  esDiaDeDescanso: boolean = false;
  fraseMotivacional: string = '';
  diaSeleccionadoIndex: number = 0;
  diaActualCalendario: number = 0; 
  
  frasesDescanso = [
    "Los músculos crecen cuando descansas, no cuando entrenas.",
    "Recarga energías hoy para romper tus límites mañana.",
    "El descanso es la preparación para tu próxima victoria.",
    "Escucha a tu cuerpo. Hoy toca recuperar.",
    "La recuperación es el arma secreta de los campeones."
  ];

  notificacion: any = {
    tipo: 'rutina',
    titulo: 'Rutina Asignada',
    nombrePlan: '',
    mensaje: '',
    icono: this.iconBarbell, 
    fotoCoach: ''
  };

  // 👇 Variables para el Perfil de Compañeros
  modalCompaneroAbierto = false;
  companeroSeleccionado: any = null;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private alertController: AlertController
  ) {
    // Registramos los íconos del modal de compañeros para que funcionen con name="..."
    addIcons({ close, 'person-add': personAdd });
  }

  async ionViewWillEnter() {
    if (this.suscripcionAuth) { this.suscripcionAuth.unsubscribe(); }

    this.suscripcionAuth = this.authService.user$.subscribe(async user => {
      if (user) {
        await this.cargarDatos(user.uid);
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  ionViewWillLeave() {
    this.limpiarSuscripciones();
  }

  ngOnDestroy() {
    this.limpiarSuscripciones();
  }

  limpiarSuscripciones() {
    if (this.suscripcionPerfil) this.suscripcionPerfil(); 
    if (this.suscripcionStories) this.suscripcionStories(); 
    if (this.suscripcionRankingTeam) this.suscripcionRankingTeam(); 
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe(); 
  }

  async cargarDatos(uid: string) {
    this.cargando = true;
    
    if (this.suscripcionPerfil) this.suscripcionPerfil();

    this.suscripcionPerfil = this.studentService.escucharPerfil(uid, async (datosPerfil) => {
  
      if (this.perfil?.equipoId && !datosPerfil?.equipoId) {
        this.mostrarAlertaExpulsion();
        this.limpiarDatosLocales();
        this.cargando = false;
        return; 
      }

      const tieneFotoReal = datosPerfil?.foto && !datosPerfil.foto.includes('ui-avatars.com');

      this.perfil = {
        ...datosPerfil,
        xpTotal: datosPerfil?.xpTotal || 0,
        foto: tieneFotoReal ? datosPerfil.foto : 'assets/avatar-h-1.png'
      };

      try {
        if (this.perfil?.equipoId) {
          const rutina: any = await this.studentService.obtenerRutinaActual(uid, this.perfil.equipoId);        
          const coach = await this.studentService.obtenerCoach(this.perfil.coachId);
          this.coachActual = coach;
          this.rutinaActual = rutina;
          
          if (rutina) {
            this.verificarNotificaciones(rutina, coach);
            this.calcularVencimiento(rutina);
          }

          // Ejecutamos la lógica de fechas y selector dinámico
          this.configurarFechaYRutina();

          this.cargarHistorias(this.perfil.equipoId);
          
          if (this.perfil.coachId) {
            this.cargarRankingDelTeam(this.perfil.coachId);
          }

        } else {
          this.limpiarDatosLocales();
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        this.cargando = false; 
      }
    });
  }

  // 👇 LÓGICA MATEMÁTICA PARA EL CALENDARIO Y SELECCIÓN
  configurarFechaYRutina() {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    this.fechaActualFormateada = new Date().toLocaleDateString('es-ES', opciones).replace(',', '');

    if (this.rutinaActual && this.rutinaActual.sesiones) {
      let diaSemana = new Date().getDay(); 
      diaSemana = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes = 0, Domingo = 6

      this.diaActualCalendario = diaSemana;
      const totalSesiones = this.rutinaActual.sesiones.length;

      // Autoseleccionar el día según el calendario
      if (diaSemana >= totalSesiones) {
        this.seleccionarDia(-1); 
      } else {
        this.seleccionarDia(diaSemana); 
      }
    } else {
      this.esDiaDeDescanso = false;
      this.sesionHoyTexto = 'Rutina Activa';
    }
  }

  // Cambia los datos de la tarjeta cuando tocan un día distinto
  seleccionarDia(index: number) {
    this.diaSeleccionadoIndex = index;
    
    if (index === -1) {
      this.esDiaDeDescanso = true;
      this.fraseMotivacional = this.frasesDescanso[Math.floor(Math.random() * this.frasesDescanso.length)];
    } else {
      this.esDiaDeDescanso = false;
      this.sesionHoyTexto = this.rutinaActual.sesiones[index]?.nombre || `Día ${index + 1}`;
    }
  }

  cargarRankingDelTeam(coachId: string) {
    if (this.suscripcionRankingTeam) this.suscripcionRankingTeam();

    const q = query(
      collection(this.firestore, 'usuarios'),
      where('coachId', '==', coachId),
      where('rol', '==', 'alumno'),
      orderBy('xpTotal', 'desc')
    );

    this.suscripcionRankingTeam = onSnapshot(q, (snapshot) => {
      let todosLosAlumnos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.rankingTeam = todosLosAlumnos.filter((u: any) => u.xpTotal > 0);
    });
  }

  cargarHistorias(equipoId: string) {
    if (this.suscripcionStories) this.suscripcionStories();
    this.suscripcionStories = this.studentService.obtenerHistoriasDelTeam(equipoId, (grupos) => {
      this.historias = grupos;
    });
  }

  async verHistoria(grupo: any) {
    const historiaReciente = grupo.historias[grupo.historias.length - 1];
    const modal = await this.modalCtrl.create({
      component: StoryViewerPage,
      componentProps: { historia: historiaReciente }
    });
    await modal.present();
  }

  async verPerfilCoach() {
    if (!this.coachActual) return;
    const modal = await this.modalCtrl.create({
      component: VerPerfilCoachComponent,
      componentProps: { coach: this.coachActual },
      breakpoints: [0, 0.85],
      initialBreakpoint: 0.85,
      cssClass: 'modal-pro-sheet' 
    });
    await modal.present();
  }

  // 👇 NUEVOS MÉTODOS PARA EL PERFIL DEL COMPAÑERO
  verPerfilCompanero(user: any) {
    this.companeroSeleccionado = user;
    this.modalCompaneroAbierto = true;
  }

  cerrarPerfilCompanero() {
    this.modalCompaneroAbierto = false;
    // Le damos 300ms a la animación para que cierre suave antes de borrar los datos
    setTimeout(() => {
      this.companeroSeleccionado = null;
    }, 300);
  }

  limpiarDatosLocales() {
    this.rutinaActual = null;
    this.coachActual = null;
    this.diasRestantes = null;
    this.historias = []; 
    this.rankingTeam = [];
  }

  async mostrarAlertaExpulsion() {
    const alert = await this.alertController.create({
      header: 'ACCESO REVOCADO 🚫',
      subHeader: 'Ya no formas parte del Team',
      message: 'Tu coach te ha eliminado del equipo o el grupo ha sido disuelto.',
      buttons: ['ENTENDIDO'],
      backdropDismiss: false
    });
    await alert.present();
  }

  async subirStory() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      const modal = await this.modalCtrl.create({
        component: UploadPreviewPage,
        componentProps: { imagePath: image.webPath }
      });
      await modal.present();

      const { data, role } = await modal.onDidDismiss();

      if (role === 'confirm' && data.confirm) {
        await this.procesarSubidaFirebase(image);
      }
    } catch (error) {
      console.log('Cancelado o Error en cámara:', error);
    }
  }

  async procesarSubidaFirebase(image: any) {
    const loading = await this.loadingCtrl.create({ message: 'Subiendo Story... 🚀', spinner: 'crescent' });
    await loading.present();

    try {
      const blob = await this.readAsBlob(image);
      if (this.perfil && this.perfil.uid) {
        const usuarioStory = {
          uid: this.perfil.uid,
          nombre: this.perfil.nombre,
          foto: this.perfil.foto || 'assets/avatar-h-1.png', 
          equipoId: this.perfil.equipoId
        };
        await this.studentService.subirHistoria(blob, usuarioStory);
        this.mostrarToast('¡Historia publicada! 🔥', 'success');
      }
    } catch (error) {
      this.mostrarToast('Error al subir.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  private async readAsBlob(photo: any) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return blob;
  }

  calcularVencimiento(rutina: any) {
    if (rutina && rutina.fechaCreacion) {
      const fechaInicio = rutina.fechaCreacion.seconds ? new Date(rutina.fechaCreacion.seconds * 1000) : new Date(rutina.fechaCreacion);
      const semanas = rutina.semanas || 4;
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + (semanas * 7));
      const hoy = new Date();
      const diferenciaMs = fechaFin.getTime() - hoy.getTime();
      this.diasRestantes = Math.ceil(diferenciaMs / (1000 * 3600 * 24));
    }
  }

  verificarNotificaciones(rutina: any, coach: any) {
    if (!rutina) return;
    const idGuardado = localStorage.getItem('ultima_rutina_id');
    const fechaGuardada = localStorage.getItem('ultima_rutina_fecha');
    const esNueva = !idGuardado || idGuardado !== rutina['id'];
    const fechaActual = rutina['fechaActualizacion'] ? rutina['fechaActualizacion'].seconds : null;
    const fueEditada = fechaActual && fechaGuardada !== fechaActual.toString();

    if (esNueva || fueEditada) {
      this.lanzarNotificacion(rutina, coach, fueEditada ? 'editado' : 'nuevo');
      localStorage.setItem('ultima_rutina_id', rutina['id']);
      if (fechaActual) localStorage.setItem('ultima_rutina_fecha', fechaActual.toString());
    }
  }

  lanzarNotificacion(rutina: any, coach: any, modo: 'nuevo' | 'editado') {
    const msj = modo === 'nuevo' ? `te acaba de asignar el plan` : `acaba de realizar AJUSTES en el plan`;
    const titulo = modo === 'nuevo' ? 'NUEVA MISIÓN' : 'PLAN ACTUALIZADO';
    
    const iconoDinamico = modo === 'nuevo' ? this.iconBarbell : this.iconConstruct; 
    
    const foto = coach?.foto || 'assets/avatar-h-1.png';

    this.notificacion = { 
      tipo: 'rutina', 
      titulo, 
      nombrePlan: rutina.nombre, 
      mensaje: msj, 
      icono: iconoDinamico,
      fotoCoach: foto 
    };
    this.mostrarBienvenida = true;
  }

  cerrarBienvenida() { this.mostrarBienvenida = false; }

  irAEntrenar() {
    if (this.diaSeleccionadoIndex === -1) return; 

    if (this.mostrarBienvenida) {
      this.cerrarBienvenida();
      setTimeout(() => {
        this.navCtrl.navigateForward(['/entreno/mi-rutina'], { 
          queryParams: { dia: this.diaSeleccionadoIndex } 
        });
      }, 350); 
    } else {
      this.navCtrl.navigateForward(['/entreno/mi-rutina'], { 
        queryParams: { dia: this.diaSeleccionadoIndex } 
      });
    }
  }

  async unirse() {
    if (!this.codigoInput) return this.mostrarToast('Escribe el código ✍️', 'warning');
    const loading = await this.loadingCtrl.create({ message: 'Verificando...' });
    await loading.present();
    try {
      await this.studentService.unirseAEquipo(this.codigoInput.trim(), this.perfil.uid);
      this.mostrarToast('¡Bienvenido al Team! 🔥', 'success');
    } catch (error: any) {
      this.mostrarToast(error.message || 'Código inválido', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async mostrarToast(msj: string, color: string) {
    const t = await this.toastCtrl.create({ message: msj, duration: 2000, color });
    t.present();
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }
}