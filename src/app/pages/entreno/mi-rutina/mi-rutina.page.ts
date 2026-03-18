import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular'; 
import { AuthService } from 'src/app/services/auth';
import { StudentService } from 'src/app/services/student';
import { addIcons } from 'ionicons';
import { 
  timeOutline, barbellOutline, checkmarkOutline, arrowBackOutline, flameOutline, playCircleOutline, reloadOutline, 
  playOutline, closeOutline, bulbOutline, flashOutline, repeatOutline, checkmarkDoneOutline, addOutline, listOutline, 
  informationCircleOutline, trophyOutline, checkmarkCircle, close
} from 'ionicons/icons';

@Component({
  selector: 'app-mi-rutina',
  templateUrl: './mi-rutina.page.html',
  styleUrls: ['./mi-rutina.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MiRutinaPage implements OnDestroy {

  public window = window;

  modalTecnicaAbierto = false;
  ejercicioSeleccionado: any = null;
  descansoActivo = false;
  tiempoRestante = 0;
  intervaloDescanso: any = null;
  
  // 👇 Cronómetro Global de la Sesión
  tiempoSesionSegundos = 0;
  intervaloSesion: any = null;

  cicloCompleto: any = null;
  sesionHoy: any = null;
  cargando = true;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private studentService: StudentService
  ) {
    // 💡 Asegúrate de incluir 'checkmarkCircle' (sin el outline) que usas en el HTML para cuando se completa el ejercicio
    addIcons({ 
      timeOutline, barbellOutline, checkmarkOutline, arrowBackOutline, flameOutline, playCircleOutline, reloadOutline, 
      playOutline, closeOutline, bulbOutline, flashOutline, repeatOutline, checkmarkDoneOutline, addOutline, listOutline, 
      informationCircleOutline, trophyOutline, checkmarkCircle, close
    });
  }

  async ionViewWillEnter() {
    this.cargando = true;
    this.authService.user$.subscribe(async user => {
      if (user) {
        const perfil = await this.studentService.obtenerMiPerfil(user.uid);
        if (perfil) {
          const rutinaRaw: any = await this.studentService.obtenerRutinaActual(user.uid, perfil['equipoId']);
          
          if (rutinaRaw && rutinaRaw.sesiones) {
            this.cicloCompleto = rutinaRaw;
            
            const indiceSesion = rutinaRaw.indiceSesionActual || 0; 
            const datosSesion = rutinaRaw.sesiones[indiceSesion];
            const hoy = this.obtenerDiaActual();
            const esDiaCorrecto = rutinaRaw.diasSugeridos ? rutinaRaw.diasSugeridos.includes(hoy) : true;

            const duracionEstimada = datosSesion.ejercicios.length * 5;

            this.sesionHoy = {
              ...datosSesion,
              progreso: 0,
              esDiaCorrecto: esDiaCorrecto,
              xp: 500, 
              duracion: duracionEstimada, 
              ejercicios: datosSesion.ejercicios.map((e: any) => ({
                ...e,
                seriesHechas: 0,
                peso: null, // Aquí el usuario anotará los kilos
                completado: false,
                nota: e.nota || '' 
              }))
            };

            // 👇 INICIAMOS EL CRONÓMETRO GLOBAL
            this.iniciarCronometroSesion();
          }
        }
        this.cargando = false;
      }
    });
  }

  obtenerDiaActual() {
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return dias[new Date().getDay()];
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

  ngOnDestroy() { 
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso); 
    if (this.intervaloSesion) clearInterval(this.intervaloSesion); 
  }

  // ==========================================
  // ⏱️ CRONÓMETRO DE LA SESIÓN
  // ==========================================
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

  // ==========================================
  // 🏋️‍♂️ LÓGICA DE SETS Y DESCANSO
  // ==========================================
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
  
  // ==========================================
  // 🏁 FINALIZAR Y CALCULAR VOLUMEN
  // ==========================================
  terminarRutina() { 
    if (this.intervaloSesion) clearInterval(this.intervaloSesion); // Detenemos el reloj

    // 🧮 CALCULADORA DE VOLUMEN (KILOS MOVIDOS)
    let volumenTotal = 0;

    this.sesionHoy.ejercicios.forEach((ej: any) => {
      // Solo sumamos si el usuario registró un peso
      if (ej.peso && ej.peso > 0) {
        
        // Extraemos el número de repeticiones (ej. "10-12" => sacamos el "10")
        let repeticionesPromedio = 10; // Valor por defecto
        
        if (ej.reps) {
           // Si el coach escribió "12", "10-12" o "al fallo", intentamos sacar el primer número
           const numerosEnReps = String(ej.reps).match(/\d+/);
           if (numerosEnReps) {
             repeticionesPromedio = parseInt(numerosEnReps[0]);
           }
        }

        // Fórmula: Peso * Repeticiones * Series Hechas
        const volumenDelEjercicio = ej.peso * repeticionesPromedio * ej.seriesHechas;
        volumenTotal += volumenDelEjercicio;
      }
    });

    // 🚀 ENVIAR DATOS A "MISIÓN CUMPLIDA"
    this.navCtrl.navigateRoot(['/entreno/resumen'], {
      state: { 
        datos: {
          nombreRutina: this.sesionHoy.nombre, // 👈 Se llama nombreRutina en tu ResumenPage
          xpGanada: this.sesionHoy.xp,
          totalKilos: volumenTotal, // 👈 Ahora sí enviamos los kilos reales
          tiempo: this.obtenerTiempoFormateado() // 👈 Enviamos el cronómetro (ej. "45:30")
        }
      }
    }); 
  }
  
  regresar() { this.navCtrl.back(); }
}