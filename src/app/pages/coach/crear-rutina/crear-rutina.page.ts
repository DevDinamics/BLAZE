import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonSpinner, IonModal, IonHeader, IonToolbar, IonFooter,
  NavController, ToastController, LoadingController, ModalController, AlertController
} from '@ionic/angular/standalone'; 
import { ActivatedRoute } from '@angular/router'; 
import { CoachService } from 'src/app/services/coach';
import { AuthService } from 'src/app/services/auth';
import { SelectorEjerciciosPage } from 'src/app/modals/selector-ejercicios/selector-ejercicios.page';

import { addIcons } from 'ionicons';
import { 
  arrowBack, copyOutline, searchOutline, documentTextOutline, personOutline, 
  chevronDownOutline, createOutline, barbellOutline, trashOutline, flashOutline, 
  addCircleOutline, closeOutline, downloadOutline, checkmarkOutline, saveOutline,
  timeOutline, add, time, folderOpenOutline, list, swapHorizontal, flameOutline, 
  calendarOutline, notificationsOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-crear-rutina',
  templateUrl: './crear-rutina.page.html',
  styleUrls: ['./crear-rutina.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonSpinner, IonModal,
    IonHeader, IonToolbar, IonFooter,
    CommonModule, FormsModule
  ] 
})
export class CrearRutinaPage implements OnInit {

  rutinaId: string | null = null; 
  uidCoach: string | null = null;
  cargandoDatos = true;
  esModoPlantilla = false;
  sesionActivaIndex = 0; 

  rutina = {
    nombre: '',
    alumnoId: '', 
    semanas: 4, 
    nivel: 'Intermedio',
    sesiones: [
      { nombre: 'DÍA 1 – PUSH', ejercicios: [] as any[] },
      { nombre: 'DÍA 2 – PULL', ejercicios: [] as any[] },
      { nombre: 'DÍA 3 – LEGS', ejercicios: [] as any[] },
      { nombre: 'DÍA 4 – PUSH 2', ejercicios: [] as any[] },
      { nombre: 'DÍA 5 – PULL 2', ejercicios: [] as any[] },
      { nombre: 'DÍA 6 – LEGS 2', ejercicios: [] as any[] }
    ]
  };

  alumnos: any[] = []; 
  rutinasActivasDelCoach: any[] = []; 
  misPlantillas: any[] = [];
  plantillasFiltradas: any[] = [];
  
  modalPlantillasAbierto = false;
  modalAlumnosAbierto = false; 

  // ─── Picker custom (scroll-snap, sin ion-picker) ──────────────────────────
  mostrarModalPicker = false;
  pickerTipo: 'series' | 'reps' | 'descanso' = 'series';
  ejercicioSeleccionadoIndex: number = -1;
  pickerOpciones: any[] = [];
  pickerValorSeleccionado: any = null;
  pickerValorSeleccionado2: any = null; // Solo para reps (max)

  constructor(
    private navCtrl: NavController,
    private coachService: CoachService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, 
    private route: ActivatedRoute 
  ) {
    addIcons({ 
      arrowBack, copyOutline, searchOutline, documentTextOutline, personOutline, 
      chevronDownOutline, createOutline, barbellOutline, trashOutline, flashOutline, 
      addCircleOutline, closeOutline, downloadOutline, checkmarkOutline, saveOutline,
      timeOutline, add, time, folderOpenOutline, list, swapHorizontal, flameOutline, 
      calendarOutline, notificationsOutline, alertCircleOutline
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.uidCoach = user.uid; 
        const todosAlumnos = await this.coachService.obtenerMisAlumnos(this.uidCoach);
        this.alumnos = todosAlumnos.filter((a: any) => a.uid !== this.uidCoach);
        const todasRutinas: any = await this.coachService.obtenerMisRutinas(this.uidCoach); 
        this.rutinasActivasDelCoach = todasRutinas.filter((r: any) => r.active === true && !r.esPlantilla);
        this.misPlantillas = await this.coachService.obtenerMisPlantillas(this.uidCoach);
        this.plantillasFiltradas = [...this.misPlantillas];
        this.rutinaId = this.route.snapshot.paramMap.get('id');
        if (this.rutinaId) await this.cargarDatosParaEditar(this.rutinaId);
        else this.cargandoDatos = false; 
      }
    });
  }

  async cargarDatosParaEditar(id: string) {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...', mode: 'ios' });
    await loading.present();
    try {
      const datos: any = await this.coachService.obtenerRutinaPorId(id); 
      if (datos) {
        this.rutina = { ...this.rutina, ...datos };
        this.esModoPlantilla = (datos.esPlantilla === true);
      }
    } catch(e) { console.error(e); }
    finally { loading.dismiss(); this.cargandoDatos = false; }
  }

  async agregarEjercicio() {
    const modal = await this.modalCtrl.create({
      component: SelectorEjerciciosPage,
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
      handle: true
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      const nuevos = data.map((ej: any) => ({
        nombre: ej.nombre,
        musculo: ej.musculo || 'General',
        imagen: ej.imagen || '',
        series: 4,
        repsMin: 8,
        repsMax: 12,
        descanso: 60,
        peso: null,
        nota: ''
      }));
      this.rutina.sesiones[this.sesionActivaIndex].ejercicios.push(...nuevos);
    }
  }

  eliminarEjercicio(index: number) {
    this.rutina.sesiones[this.sesionActivaIndex].ejercicios.splice(index, 1);
  }

  async guardarRutina() {
    if (!this.rutina.nombre) return this.mostrarToast('Agrega un nombre al plan', 'warning');
    if (!this.esModoPlantilla && !this.rutina.alumnoId) return this.mostrarToast('Selecciona a un alumno', 'warning');
    this.ejecutarGuardadoFinal();
  }

  async ejecutarGuardadoFinal() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();
    try {
      await this.coachService.crearRutina({ ...this.rutina, coachId: this.uidCoach, active: true });
      this.mostrarToast('Plan guardado con éxito', 'success');
      this.navCtrl.back();
    } catch (e) {
      this.mostrarToast('Error', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // ─── Picker Logic ─────────────────────────────────────────────────────────

  get tituloPicker(): string {
    if (this.pickerTipo === 'series') return 'Series';
    if (this.pickerTipo === 'reps') return 'Repeticiones';
    return 'Descanso';
  }

  abrirPicker(tipo: 'series' | 'reps' | 'descanso', indexEjercicio: number) {
    this.pickerTipo = tipo;
    this.ejercicioSeleccionadoIndex = indexEjercicio;
    const ej = this.rutina.sesiones[this.sesionActivaIndex].ejercicios[indexEjercicio];

    if (tipo === 'series') {
      this.pickerOpciones = Array.from({ length: 10 }, (_, i) => ({ text: `${i + 1}`, value: i + 1 }));
      this.pickerValorSeleccionado  = ej.series;
      this.pickerValorSeleccionado2 = null;

    } else if (tipo === 'reps') {
      this.pickerOpciones = Array.from({ length: 30 }, (_, i) => ({ text: `${i + 1}`, value: i + 1 }));
      this.pickerValorSeleccionado  = ej.repsMin ?? 8;
      this.pickerValorSeleccionado2 = ej.repsMax ?? 12;

    } else {
      this.pickerOpciones = [
        { text: '15s',   value: 15  },
        { text: '30s',   value: 30  },
        { text: '45s',   value: 45  },
        { text: '60s',   value: 60  },
        { text: '75s',   value: 75  },
        { text: '90s',   value: 90  },
        { text: '2 min', value: 120 },
        { text: '3 min', value: 180 }
      ];
      this.pickerValorSeleccionado  = ej.descanso;
      this.pickerValorSeleccionado2 = null;
    }

    this.mostrarModalPicker = true;
  }

  /**
   * confirmarPicker — guarda los valores en el ejercicio y cierra el modal.
   * Para reps usa pickerValorSeleccionado (min) y pickerValorSeleccionado2 (max).
   */
  confirmarPicker() {
    const ej = this.rutina.sesiones[this.sesionActivaIndex].ejercicios[this.ejercicioSeleccionadoIndex];

    if (this.pickerTipo === 'series') {
      ej.series = this.pickerValorSeleccionado;

    } else if (this.pickerTipo === 'reps') {
      // Nos aseguramos de que ambos valores existan antes de guardar
      ej.repsMin = this.pickerValorSeleccionado  ?? ej.repsMin;
      ej.repsMax = this.pickerValorSeleccionado2 ?? ej.repsMax;

    } else {
      ej.descanso = this.pickerValorSeleccionado;
    }

    this.mostrarModalPicker = false;
  }

  /**
   * onWheelScroll — actualiza el valor seleccionado mientras el usuario arrastra.
   * Cada ítem ocupa 44px. El padding inicial (spacer) es de 86px pero el
   * scrollTop empieza en 0 justo cuando el primer ítem entra al centro,
   * así que el índice es simplemente Math.round(scrollTop / 44).
   *
   * @param event   Evento nativo de scroll del div
   * @param columna 1 = columna izquierda/única  |  2 = columna derecha (repsMax)
   */
  onWheelScroll(event: Event, columna: number) {
    const el = event.target as HTMLElement;
    const index = Math.round(el.scrollTop / 44);
    const opt   = this.pickerOpciones[index];
    if (!opt) return;

    if (columna === 1) this.pickerValorSeleccionado  = opt.value;
    else               this.pickerValorSeleccionado2 = opt.value;
  }

  // ─── Navigation & Helpers ─────────────────────────────────────────────────

  regresar() { this.navCtrl.back(); }

  async mostrarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, color: c, mode: 'ios' });
    t.present();
  }

  abrirModalPlantillas()  { this.modalPlantillasAbierto = true;  }
  cerrarModalPlantillas() { this.modalPlantillasAbierto = false; }
  abrirModalAlumnos()     { this.modalAlumnosAbierto = true;     }
  cerrarModalAlumnos()    { this.modalAlumnosAbierto = false;    }

  seleccionarAlumno(a: any) {
    this.rutina.alumnoId = a.uid;
    this.cerrarModalAlumnos();
  }

  buscarPlantilla(ev: any) {
    const t = ev.target.value.toLowerCase();
    this.plantillasFiltradas = this.misPlantillas.filter(p => p.nombre.toLowerCase().includes(t));
  }

  seleccionarPlantilla(p: any) {
    this.rutina.sesiones = JSON.parse(JSON.stringify(p.sesiones || []));
    this.cerrarModalPlantillas();
  }
}