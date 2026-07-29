import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { 
  IonHeader, IonToolbar, IonContent, IonIcon, IonFooter, 
  IonModal, NavController, ToastController, LoadingController 
} from '@ionic/angular/standalone'; 

import { AuthService } from 'src/app/services/auth';
import { StudentService } from 'src/app/services/student';
import { addIcons } from 'ionicons';

import { 
  timeOutline, barbellOutline, checkmarkOutline, arrowBackOutline, flameOutline, 
  playCircleOutline, reloadOutline, playOutline, closeOutline, bulbOutline, 
  flashOutline, repeatOutline, checkmarkDoneOutline, addOutline, listOutline, 
  informationCircleOutline, trophyOutline, checkmarkCircle, close, lockClosedOutline
} from 'ionicons/icons';

import { Firestore, doc, updateDoc, increment } from '@angular/fire/firestore';

@Component({
  selector: 'app-mi-rutina',
  templateUrl: './mi-rutina.page.html',
  styleUrls: ['./mi-rutina.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonContent, IonIcon, IonFooter, IonModal
  ]
})
export class MiRutinaPage implements OnDestroy {

  public window = window;

  private firestore = inject(Firestore);
  uidAlumno: string = ''; 

  tieneRutina: boolean = false;

  // 🛡️ Bindings directos para los íconos
  iconInfo = informationCircleOutline;
  iconTime = timeOutline;
  iconFlame = flameOutline;
  iconCheckCircle = checkmarkCircle;
  iconRepeat = repeatOutline;
  iconPlayCircle = playCircleOutline;
  iconFlash = flashOutline;
  iconCheck = checkmarkOutline;
  iconReload = reloadOutline;
  iconClose = closeOutline;
  iconBulb = bulbOutline;
  iconTrophy = trophyOutline;
  iconLock = lockClosedOutline;
  iconBarbell = barbellOutline;

  modalTecnicaAbierto = false;
  ejercicioSeleccionado: any = null;
  descansoActivo = false;
  tiempoRestante = 0;
  intervaloDescanso: any = null;
  
  tiempoSesionSegundos = 0;
  intervaloSesion: any = null;

  cicloCompleto: any = null;
  sesionHoy: any = null;
  cargando = true;

  private subUser: Subscription | null = null;
  private subQueryParams: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private studentService: StudentService,
    private route: ActivatedRoute
  ) {
    addIcons({ 
      timeOutline, barbellOutline, checkmarkOutline, arrowBackOutline, flameOutline, 
      playCircleOutline, reloadOutline, playOutline, closeOutline, bulbOutline, 
      flashOutline, repeatOutline, checkmarkDoneOutline, addOutline, listOutline, 
      informationCircleOutline, trophyOutline, checkmarkCircle, close, lockClosedOutline,
      'trophy-outline': trophyOutline,
      'lock-closed-outline': lockClosedOutline,
      'barbell-outline': barbellOutline,
      'flash-outline': flashOutline
    });
  }

  async ionViewWillEnter() {
    this.cargando = true;
    this.limpiarSuscripciones();

    this.subUser = this.authService.user$.subscribe(async user => {
      if (user) {
        this.uidAlumno = user.uid; 

        const perfil = await this.studentService.obtenerMiPerfil(user.uid);
        if (perfil) {
          const rutinaRaw: any = await this.studentService.obtenerRutinaActual(user.uid, perfil['equipoId']);
          
          if (rutinaRaw && rutinaRaw.sesiones && rutinaRaw.sesiones.length > 0) {
            
            this.tieneRutina = true;
            this.cicloCompleto = rutinaRaw;
            
            this.subQueryParams = this.route.queryParams.subscribe(params => {
              // 🚀 FIX: Si la sesión ya fue cargada previamente en memoria, no la reiniciamos para no perder el peso
              if (this.sesionHoy && this.sesionHoy.ejercicios && this.sesionHoy.ejercicios.length > 0) {
                this.cargando = false;
                return;
              }

              let indiceSesionAEntrenar = 0;
              if (params['dia'] !== undefined) {
                indiceSesionAEntrenar = parseInt(params['dia'], 10);
              } else {
                let diaSemana = new Date().getDay(); 
                diaSemana = diaSemana === 0 ? 6 : diaSemana - 1; 
                indiceSesionAEntrenar = diaSemana >= rutinaRaw.sesiones.length ? 0 : diaSemana; 
              }
              
              const datosSesion = rutinaRaw.sesiones[indiceSesionAEntrenar];
              if (!datosSesion) return;
              
              let diaReal = new Date().getDay();
              diaReal = diaReal === 0 ? 6 : diaReal - 1;
              const esDiaCorrecto = indiceSesionAEntrenar === diaReal;

              const duracionEstimada = datosSesion.ejercicios ? datosSesion.ejercicios.length * 5 : 30;

              this.sesionHoy = {
                ...datosSesion,
                progreso: 0,
                esDiaCorrecto: esDiaCorrecto,
                xp: 500, 
                duracion: duracionEstimada, 
                ejercicios: (datosSesion.ejercicios || []).map((e: any) => ({
                  ...e,
                  seriesHechas: 0,
                  peso: e.peso || null,
                  completado: false,
                  nota: e.nota || '' 
                }))
              };

              this.iniciarCronometroSesion();
            });
          } else {
            this.tieneRutina = false;
          }
        }
        this.cargando = false;
      }
    });
  }

  ionViewWillLeave() {
    this.limpiarSuscripciones();
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso); 
    if (this.intervaloSesion) clearInterval(this.intervaloSesion); 
  }

  ngOnDestroy() { 
    this.limpiarSuscripciones();
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso); 
    if (this.intervaloSesion) clearInterval(this.intervaloSesion); 
  }

  private limpiarSuscripciones() {
    if (this.subUser) this.subUser.unsubscribe();
    if (this.subQueryParams) this.subQueryParams.unsubscribe();
  }

  trackByEjercicios(index: number, item: any) {
    return item.nombre || index;
  }

  // ⚡ INYECCIÓN DE PESO EN TIEMPO REAL
  actualizarPeso(index: number, val: any) {
    if (this.sesionHoy && this.sesionHoy.ejercicios && this.sesionHoy.ejercicios[index]) {
      const parsed = parseFloat(val);
      this.sesionHoy.ejercicios[index].peso = isNaN(parsed) ? 0 : parsed;
      console.log(`⚖️ Peso asignado al ejercicio ${index + 1}:`, this.sesionHoy.ejercicios[index].peso);
    }
  }

  getNotaClass(nota: string) {
    const n = nota.toLowerCase();
    if (n.includes('fallo') || n.includes('pesada') || n.includes('top set')) 
      return 'bg-red-50 border-red-100 text-red-600';
    if (n.includes('dropset') || n.includes('cluster') || n.includes('rest')) 
      return 'bg-purple-50 border-purple-100 text-purple-600';
    if (n.includes('lenta') || n.includes('negativa') || n.includes('tempo')) 
      return 'bg-blue-50 border-blue-100 text-blue-600';
      
    return 'bg-orange-50 border-orange-100 text-orange-600';
  }

  iniciarCronometroSesion() {
    this.tiempoSesionSegundos = 0;
    if (this.intervaloSesion) clearInterval(this.intervaloSesion);
    
    this.intervaloSesion = setInterval(() => {
      this.tiempoSesionSegundos++;
    }, 1000);
  }

  obtenerTiempoFormateado() {
    const minutos = Math.floor(this.tiempoSesionSegundos / 60);
    const segundos = this.tiempoSesionSegundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  async registrarSet(index: number) {
    if (!this.sesionHoy) return;
    const ejercicio = this.sesionHoy.ejercicios[index];
    if (ejercicio.completado) return;
    
    ejercicio.seriesHechas++;
    
    const toast = await this.toastCtrl.create({
      message: 'Set registrado 🔥', duration: 1000, color: 'dark', position: 'bottom', cssClass: 'text-center text-xs font-bold'
    });
    toast.present();

    if (ejercicio.seriesHechas >= ejercicio.series) {
      ejercicio.completado = true;
      this.saltarDescanso();
    } else {
      this.iniciarDescanso();
    }
    this.calcularProgreso();
  }

  undoSet(index: number) {
    const ejercicio = this.sesionHoy.ejercicios[index];
    if (ejercicio.seriesHechas > 0) {
      ejercicio.seriesHechas--;
      ejercicio.completado = false;
      this.calcularProgreso();
    }
  }

  calcularProgreso() {
    if (!this.sesionHoy) return;
    let total = 0, hechas = 0;
    this.sesionHoy.ejercicios.forEach((e: any) => {
      total += (e.series || 0);
      hechas += (e.seriesHechas || 0);
    });
    this.sesionHoy.progreso = total > 0 ? (hechas / total) : 0;
  }

  iniciarDescanso() {
    this.saltarDescanso(); 
    this.descansoActivo = true;
    this.tiempoRestante = 60; 
    this.intervaloDescanso = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) this.saltarDescanso();
    }, 1000);
  }

  sumarTiempo(s: number) { this.tiempoRestante += s; }
  saltarDescanso() { this.descansoActivo = false; if (this.intervaloDescanso) clearInterval(this.intervaloDescanso); }
  
  verTecnica(ejercicio: any) { 
    this.ejercicioSeleccionado = ejercicio; 
    this.modalTecnicaAbierto = true; 
  }

  cerrarTecnica() { 
    this.modalTecnicaAbierto = false; 
    this.ejercicioSeleccionado = null;
  }
  
  async terminarRutina() { 
    if (this.intervaloSesion) clearInterval(this.intervaloSesion);

    let volumenTotal = 0;

    console.log('🔍 DEPURANDO EJERCICIOS AL FINALIZAR:', this.sesionHoy?.ejercicios);

    if (this.sesionHoy && Array.isArray(this.sesionHoy.ejercicios)) {
      this.sesionHoy.ejercicios.forEach((ej: any, idx: number) => {
        
        // 1. Lectura del peso
        const pesoNum = Number(ej.peso) || parseFloat(ej.peso) || 0;

        if (pesoNum > 0) {
          // 2. Series efectivas: Si marcó con botón usamos seriesHechas, si no, tomamos la meta del ejercicio o 1
          const seriesTotales = (ej.seriesHechas && ej.seriesHechas > 0) 
            ? ej.seriesHechas 
            : (Number(ej.series) || Number(ej.seriesObjetivo) || 1);

          // 3. Repeticiones
          let repsNum = 10;
          if (ej.repsMin) {
            repsNum = Number(ej.repsMin);
          } else if (ej.reps) {
            const extraido = String(ej.reps).match(/\d+/);
            if (extraido) repsNum = Number(extraido[0]);
          }

          const subtotal = pesoNum * repsNum * seriesTotales;
          
          console.log(`🏋️ Ejercicio ${idx + 1} (${ej.nombre}):`, {
            pesoLeido: pesoNum,
            seriesUsadas: seriesTotales,
            repsUsadas: repsNum,
            subtotalKilos: subtotal
          });

          volumenTotal += subtotal;
        }
      });
    }

    console.log('🔥 VOLUMEN TOTAL CALCULADO:', volumenTotal);

    try {
      const alumnoRef = doc(this.firestore, `usuarios/${this.uidAlumno}`);
      await updateDoc(alumnoRef, {
        ultimaActividad: new Date(),
        rachaActual: increment(1) 
      });
      console.log('¡Racha actualizada en Firebase!');
    } catch (error) {
      console.error('Error al actualizar la racha:', error);
    }

    this.navCtrl.navigateRoot(['/entreno/resumen'], {
      state: { 
        datos: {
          nombreRutina: this.sesionHoy?.nombre || 'Entrenamiento', 
          xpGanada: this.sesionHoy?.xp || 500,
          totalKilos: volumenTotal, 
          tiempo: this.obtenerTiempoFormateado() 
        }
      }
    }); 
  }
  
  regresar() { this.navCtrl.back(); }
}