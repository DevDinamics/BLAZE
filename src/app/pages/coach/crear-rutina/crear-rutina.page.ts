import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController, ModalController, AlertController } from '@ionic/angular'; 
import { ActivatedRoute } from '@angular/router'; 
import { CoachService } from 'src/app/services/coach';
import { AuthService } from 'src/app/services/auth';
import { SelectorEjerciciosPage } from 'src/app/modals/selector-ejercicios/selector-ejercicios.page';

// 👇 Importamos TODOS los iconos que usas en el HTML
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
  imports: [IonicModule, CommonModule, FormsModule] 
})
export class CrearRutinaPage implements OnInit {

  rutinaId: string | null = null; 
  uidCoach: string | null = null;
  cargandoDatos = true;
  esModoPlantilla = false;
  guardarComoPlantilla = false;
  sesionActivaIndex = 0; 

  rutina = {
    nombre: '',
    alumnoId: '', 
    semanas: 4, 
    nivel: 'Intermedio',
    enfoque: 'Hipertrofia',
    sesiones: [
      { nombre: 'DÍA 1 – PUSH', ejercicios: [] as any[] },
      { nombre: 'DÍA 2 – PULL', ejercicios: [] as any[] },
      { nombre: 'DÍA 3 – LEGS', ejercicios: [] as any[] },
      { nombre: 'DÍA 4 – PUSH 2', ejercicios: [] as any[] },
      { nombre: 'DÍA 5 – PULL 2', ejercicios: [] as any[] },
      { nombre: 'DÍA 6 – LEGS 2', ejercicios: [] as any[] }
    ],
    diasSugeridos: [] as string[]
  };

  alumnos: any[] = []; 
  rutinasActivasDelCoach: any[] = []; 
  misPlantillas: any[] = [];
  plantillasFiltradas: any[] = [];
  
  modalPlantillasAbierto = false;
  modalAlumnosAbierto = false; 
  
  textoBusqueda = '';

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
    // 👇 REGISTRAMOS TODOS LOS ICONOS (Igual que en Mis Alumnos)
    addIcons({ 
      'arrow-back': arrowBack, 
      'copy-outline': copyOutline, 
      'search-outline': searchOutline, 
      'document-text-outline': documentTextOutline, 
      'person-outline': personOutline, 
      'chevron-down-outline': chevronDownOutline, 
      'create-outline': createOutline, 
      'barbell-outline': barbellOutline, 
      'trash-outline': trashOutline, 
      'flash-outline': flashOutline, 
      'add-circle-outline': addCircleOutline, 
      'close-outline': closeOutline, 
      'download-outline': downloadOutline, 
      'checkmark-outline': checkmarkOutline, 
      'save-outline': saveOutline,
      'time-outline': timeOutline, 'add': add, 'time': time, 'folder-open-outline': folderOpenOutline, 
      'list': list, 'swap-horizontal': swapHorizontal, 'flame-outline': flameOutline, 
      'calendar-outline': calendarOutline, 'notifications-outline': notificationsOutline, 
      'alert-circle-outline': alertCircleOutline
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['preselectAlumno']) {
        this.rutina.alumnoId = params['preselectAlumno'];
      }
    });

    this.authService.user$.subscribe(async user => {
      if (user) {
        this.uidCoach = user.uid; 
        const todosAlumnos = await this.coachService.obtenerMisAlumnos(this.uidCoach);
        this.alumnos = todosAlumnos.filter((a: any) => 
          a.uid !== this.uidCoach && a.nombre && a.nombre.toLowerCase() !== 'admin' && !a.nombre.toLowerCase().includes('administrador')
        );

        const todasRutinas: any = await this.coachService.obtenerMisRutinas(this.uidCoach); 
        this.rutinasActivasDelCoach = todasRutinas.filter((r: any) => r.active === true && !r.esPlantilla);
        this.misPlantillas = await this.coachService.obtenerMisPlantillas(this.uidCoach);
        this.plantillasFiltradas = [...this.misPlantillas];

        this.rutinaId = this.route.snapshot.paramMap.get('id');
        const modo = this.route.snapshot.paramMap.get('modo');

        if (this.rutinaId) {
          await this.cargarDatosParaEditar(this.rutinaId);
        } else {
          this.esModoPlantilla = (modo === 'plantilla');
          this.cargandoDatos = false; 
        }
      }
    });
  }

  async verificarAlumno() {
    if (!this.rutina.alumnoId) return;
    const rutinaExistente = this.rutinasActivasDelCoach.find(r => r.alumnoId === this.rutina.alumnoId);

    if (rutinaExistente) {
      const alert = await this.alertCtrl.create({
        header: 'Plan Activo Detectado',
        message: 'Este alumno ya tiene una rutina. Si continúas, la actual se archivará.',
        mode: 'ios',
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => { this.rutina.alumnoId = ''; } },
          {
            text: 'Reemplazar', role: 'confirm',
            handler: async () => {
              await this.coachService.actualizarRutina(rutinaExistente.id, { active: false });
              this.mostrarToast('Rutina anterior archivada', 'medium');
              this.rutinasActivasDelCoach = this.rutinasActivasDelCoach.filter(r => r.id !== rutinaExistente.id);
            }
          }
        ]
      });
      await alert.present();
    }
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
      component: SelectorEjerciciosPage, breakpoints: [0, 0.9], initialBreakpoint: 0.9, handle: true 
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      const nuevos = data.map((ej: any) => ({
        nombre: ej.nombre, musculo: ej.musculo || 'General', imagen: ej.imagen || '',
        series: 4, reps: '10-12', descanso: 60, peso: null, nota: ''
      }));
      this.rutina.sesiones[this.sesionActivaIndex].ejercicios.push(...nuevos);
    }
  }

  eliminarEjercicio(index: number) { this.rutina.sesiones[this.sesionActivaIndex].ejercicios.splice(index, 1); }

  async guardarRutina() {
    if (!this.rutina.nombre) return this.mostrarToast('Agrega un nombre al plan', 'warning');
    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();

    try {
      const alumnoSelect = this.alumnos.find(a => a.uid === this.rutina.alumnoId);
      const totalEjercicios = this.rutina.sesiones.reduce((total, sesion) => total + sesion.ejercicios.length, 0);

      const datosBase = {
        ...this.rutina, coachId: this.uidCoach, active: true, esPlantilla: this.esModoPlantilla,
        nombreAlumno: alumnoSelect?.nombre || 'Alumno', totalEjercicios: totalEjercicios 
      };

      if (this.rutinaId) {
        await this.coachService.actualizarRutina(this.rutinaId, { ...datosBase, fechaActualizacion: new Date() });
      } else {
        await this.coachService.crearRutina({ ...datosBase, fechaCreacion: new Date() });
      }
      this.mostrarToast('Plan guardado con éxito', 'success');
      this.navCtrl.back();
    } catch (e) { this.mostrarToast('Error al guardar', 'danger'); } 
    finally { loading.dismiss(); }
  }

  abrirModalPlantillas() { this.modalPlantillasAbierto = true; }
  cerrarModalPlantillas() { this.modalPlantillasAbierto = false; }
  buscarPlantilla(ev: any) {
    const t = ev.target.value.toLowerCase();
    this.plantillasFiltradas = this.misPlantillas.filter(p => p.nombre.toLowerCase().includes(t));
  }
  seleccionarPlantilla(p: any) {
    this.rutina.sesiones = JSON.parse(JSON.stringify(p.sesiones || []));
    this.rutina.nombre = p.nombre + ' (Copia)';
    if (p.semanas) this.rutina.semanas = p.semanas;
    if (p.nivel) this.rutina.nivel = p.nivel;
    this.cerrarModalPlantillas();
  }

  abrirModalAlumnos() { this.modalAlumnosAbierto = true; }
  cerrarModalAlumnos() { this.modalAlumnosAbierto = false; }
  seleccionarAlumno(alumno: any) {
    this.rutina.alumnoId = alumno.uid;
    this.cerrarModalAlumnos();
    setTimeout(() => { this.verificarAlumno(); }, 300);
  }

  regresar() { this.navCtrl.back(); }
  async mostrarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, color: c, mode: 'ios' });
    t.present();
  }
}