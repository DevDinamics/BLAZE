import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonIcon, IonFooter, IonModal,
  NavController, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, saveOutline, addOutline, trashOutline, restaurantOutline,
  flameOutline, waterOutline, leafOutline, chevronDownOutline, closeCircleOutline,
  addCircleOutline, personOutline, closeOutline, pencilOutline, fastFoodOutline,
  calculatorOutline, checkmarkCircleOutline, person, checkmarkCircle,
  barbellOutline, syncOutline, flashOutline // ✅ Íconos nuevos integrados
} from 'ionicons/icons';

import {
  Firestore, collection, query, where, getDocs, addDoc, writeBatch, doc, updateDoc,
  serverTimestamp       
} from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

// ============================================================
// ✅ INTERFACES
// ============================================================
interface Alumno {
  uid: string;
  nombre: string;
}

interface Alimento {
  nombre: string;
  cantidad: string;
  kcal: number;
  prote: number;
  carbs: number;
  grasa: number;
}

interface Comida {
  nombre: string;
  hora: string;
  alimentos: Alimento[];
}

interface PlanForm {
  nombre: string;
  alumnoId: string;
  metaCalorias: number;
  objetivo: string;
  metaProte: number;
  metaCarbs: number;
  metaGrasa: number;
  metaAgua: number;
}

interface TempAlimento {
  nombre: string;
  cantidad: string;
  kcal: number | null;
  prote: number | null;
  carbs: number | null;
  grasa: number | null;
}

const IMAGENES_POR_COMIDA: Record<string, string> = {
  desayuno:    'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=500&q=80',
  almuerzo:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
  comida:      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
  cena:        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=80',
  snack:       'https://images.unsplash.com/photo-1559181567-c3190ca9be35?auto=format&fit=crop&w=500&q=80',
  merienda:    'https://images.unsplash.com/photo-1559181567-c3190ca9be35?auto=format&fit=crop&w=500&q=80',
  'pre-entreno': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=80',
  'post-entreno': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=80',
  default:     'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80'
};

@Component({
  selector: 'app-crear-dieta',
  templateUrl: './crear-dieta.page.html',
  styleUrls: ['./crear-dieta.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonIcon, IonFooter, IonModal,
    CommonModule, FormsModule
  ]
})
export class CrearDietaPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);

  coachActual: any = null;
  suscripcionAuth: Subscription | null = null;
  misAlumnos: Alumno[] = [];
  idDietaEdicion: string | null = null;

  plan: PlanForm = {
    nombre: '',
    alumnoId: 'PLANTILLA',
    metaCalorias: 2500,
    objetivo: 'Bajar Grasa',
    metaProte: 200,
    metaCarbs: 250,
    metaGrasa: 80,
    metaAgua: 3000
  };

  comidas: Comida[] = [
    { nombre: 'Desayuno', hora: '08:00', alimentos: [] }
  ];

  objetivos = ['Bajar Grasa', 'Aumentar Músculo', 'Mantenimiento', 'Rendimiento Deportivo'];

  // Modales de control
  mostrarModalComida   = false;
  tempNombreComida     = '';

  mostrarModalAlimento       = false;
  tempAlimento: TempAlimento = { nombre: '', cantidad: '', kcal: null, prote: null, carbs: null, grasa: null };
  indiceComidaParaAlimento   = -1;

  // ✅ Variables de control para los nuevos modales Premium
  mostrarModalDestino = false;
  mostrarModalObjetivo = false;

  constructor(
    private navCtrl:     NavController,
    private toastCtrl:   ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) {
    addIcons({
      arrowBackOutline, saveOutline, addOutline, trashOutline, restaurantOutline,
      flameOutline, waterOutline, leafOutline, chevronDownOutline, closeCircleOutline,
      addCircleOutline, personOutline, closeOutline, pencilOutline, fastFoodOutline,
      calculatorOutline, checkmarkCircleOutline, person, checkmarkCircle,
      barbellOutline, syncOutline, flashOutline
    });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['plantilla']) {
      const tpl  = nav.extras.state['plantilla'];
      const data = tpl.rawDoc;

      this.idDietaEdicion = nav.extras.state['esEdicion'] ? tpl.id : null;

      this.plan.nombre       = data.nombrePlan;
      this.plan.objetivo     = data.objetivo;
      this.plan.alumnoId     = data.alumnoId || 'PLANTILLA';
      this.plan.metaCalorias = data.metas.calorias;
      this.plan.metaProte    = data.metas.proteina;
      this.plan.metaCarbs    = data.metas.carbos;
      this.plan.metaGrasa    = data.metas.grasa;
      this.plan.metaAgua     = data.metas.agua || 3000;

      if (data.comidasBase) {
        this.comidas = JSON.parse(JSON.stringify(data.comidasBase));
      }
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['preselectAlumno']) {
        this.plan.alumnoId = params['preselectAlumno'];
      }
    });

    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.coachActual = user;
        this.cargarMisAlumnos(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe();
  }

  async cargarMisAlumnos(coachId: string) {
    try {
      const q = query(
        collection(this.firestore, 'usuarios'),
        where('coachId', '==', coachId),
        where('rol', 'in', ['alumno', 'atleta']) 
      );
      
      const snapshot = await getDocs(q);
      
      this.misAlumnos = snapshot.docs.map(d => ({
        uid:    d.id,
        nombre: d.data()['nombre'] as string
      }));
    } catch (error) { console.error(error); }
  }

  regresar() { this.navCtrl.back(); }

  // ── ✅ MODAL DESTINO DEL PLAN (APPLE STYLE) ────────────────────
  abrirModalDestino() { this.mostrarModalDestino = true; }
  cerrarModalDestino() { this.mostrarModalDestino = false; }

  seleccionarDestino(id: string) {
    this.plan.alumnoId = id;
    this.cerrarModalDestino();
  }

  obtenerNombreAlumnoSeleccionado(): string {
    if (this.plan.alumnoId === 'PLANTILLA') return 'Guardar como Plantilla';
    const alumno = this.misAlumnos.find(a => a.uid === this.plan.alumnoId);
    return alumno ? alumno.nombre : 'Seleccionar Destino';
  }

  // ── ✅ MODAL OBJETIVO (APPLE STYLE) ────────────────────────────
  abrirModalObjetivo() { this.mostrarModalObjetivo = true; }
  cerrarModalObjetivo() { this.mostrarModalObjetivo = false; }

  seleccionarObjetivo(obj: string) {
    this.plan.objetivo = obj;
    this.cerrarModalObjetivo();
  }

  obtenerIconoObjetivo(obj: string): string {
    switch (obj) {
      case 'Bajar Grasa': return 'flame-outline';
      case 'Aumentar Músculo': return 'barbell-outline';
      case 'Mantenimiento': return 'sync-outline';
      case 'Rendimiento Deportivo': return 'flash-outline';
      default: return 'leaf-outline';
    }
  }

  // ── MODAL COMIDA ──────────────────────────────────────────
  agregarComida()      { this.tempNombreComida = ''; this.mostrarModalComida = true; }
  cerrarModalComida()  { this.mostrarModalComida = false; }

  confirmarNuevaComida() {
    if (!this.tempNombreComida.trim()) {
      this.mostrarToast('Por favor escribe un nombre.', 'warning');
      return;
    }
    this.comidas.push({ nombre: this.tempNombreComida.trim(), hora: '12:00', alimentos: [] });
    this.cerrarModalComida();
  }

  eliminarComida(index: number) { this.comidas.splice(index, 1); }

  // ── MODAL ALIMENTO ────────────────────────────────────────
  agregarAlimento(indexComida: number) {
    this.indiceComidaParaAlimento = indexComida;
    this.tempAlimento = { nombre: '', cantidad: '', kcal: null, prote: null, carbs: null, grasa: null };
    this.mostrarModalAlimento = true;
  }

  cerrarModalAlimento() { this.mostrarModalAlimento = false; this.indiceComidaParaAlimento = -1; }

  confirmarNuevoAlimento() {
    const d = this.tempAlimento;
    if (!d.nombre.trim()) {
      this.mostrarToast('Falta el nombre del alimento.', 'warning');
      return;
    }
    if (this.indiceComidaParaAlimento !== -1) {
      this.comidas[this.indiceComidaParaAlimento].alimentos.push({
        nombre:   d.nombre.trim(),
        cantidad: d.cantidad || '1 porción',
        kcal:     Number(d.kcal)  || 0,
        prote:    Number(d.prote) || 0,
        carbs:    Number(d.carbs) || 0,
        grasa:    Number(d.grasa) || 0
      });
    }
    this.cerrarModalAlimento();
  }

  eliminarAlimento(iComida: number, iAlimento: number) {
    this.comidas[iComida].alimentos.splice(iAlimento, 1);
  }

  // ── TOTALES ───────────────────────────────────────────────
  get totales(): { kcal: number; prote: number; carbs: number; grasa: number } {
    let kcal = 0, prote = 0, carbs = 0, grasa = 0;
    this.comidas.forEach(c =>
      c.alimentos.forEach(a => {
        kcal  += a.kcal;
        prote += a.prote;
        carbs += a.carbs;
        grasa += a.grasa;
      })
    );
    return { kcal, prote, carbs, grasa };
  }

  get balanceCalorico(): { calsReales: number; diferencia: number; ok: boolean } {
    const t = this.totales;
    const calsReales = (t.prote * 4) + (t.carbs * 4) + (t.grasa * 9);
    const diferencia = Math.abs(calsReales - t.kcal);
    return { calsReales, diferencia, ok: diferencia < 50 };
  }

  autoCalcularMacros() {
    const kcal = this.plan.metaCalorias;
    this.plan.metaProte = Math.round((kcal * 0.30) / 4);
    this.plan.metaCarbs = Math.round((kcal * 0.40) / 4);
    this.plan.metaGrasa = Math.round((kcal * 0.30) / 9);
    this.mostrarToast('Macros calculados automáticamente', 'success');
  }

  private getImagenComida(nombreComida: string): string {
    const lower = nombreComida.toLowerCase();
    const key   = Object.keys(IMAGENES_POR_COMIDA).find(k => lower.includes(k));
    return IMAGENES_POR_COMIDA[key ?? 'default'];
  }

  // ── GUARDAR ───────────────────────────────────────────────
  async guardarPlan() {
    if (!this.plan.nombre.trim()) {
      this.mostrarToast('Ponle nombre al plan.', 'danger');
      return;
    }

    if (this.comidas.length === 0) {
      this.mostrarToast('Agrega al menos una comida al plan.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();

    try {
      const esPlantilla = this.plan.alumnoId === 'PLANTILLA';

      const comidasFormateadas = this.comidas.map(c => {
        let kcal = 0, p = 0, carbs = 0, g = 0;
        const nombres: string[] = [];

        c.alimentos.forEach(a => {
          kcal  += a.kcal;
          p     += a.prote;
          carbs += a.carbs;
          g     += a.grasa;
          nombres.push(`${a.nombre} (${a.cantidad})`);
        });

        return {
          tipo:      c.nombre,
          hora:      c.hora || '12:00',
          nombre:    nombres.join(', ') || 'Libre',
          calorias:  kcal,
          macros:    `${p}g P • ${carbs}g C • ${g}g G`,
          macrosNum: { proteina: p, carbos: carbs, grasa: g },
          imagen:    this.getImagenComida(c.nombre),
          completado: false
        };
      });

      const datosDieta = {
        coachId:       this.coachActual.uid,
        alumnoId:      esPlantilla ? null : this.plan.alumnoId,
        esPlantilla:   esPlantilla,
        nombrePlan:    this.plan.nombre.trim(),
        objetivo:      this.plan.objetivo,
        activa:        !esPlantilla,
        fechaCreacion: serverTimestamp(),
        metas: {
          calorias: this.plan.metaCalorias,
          proteina: this.plan.metaProte,
          carbos:   this.plan.metaCarbs,
          grasa:    this.plan.metaGrasa,
          agua:     this.plan.metaAgua
        },
        comidas:    comidasFormateadas,
        comidasBase: this.comidas
      };

      if (this.idDietaEdicion) {
        await updateDoc(doc(this.firestore, 'dietas', this.idDietaEdicion), datosDieta);
      } else {
        if (esPlantilla) {
          await addDoc(collection(this.firestore, 'dietas'), datosDieta);
        } else {
          const batch = writeBatch(this.firestore);
          const q     = query(
            collection(this.firestore, 'dietas'),
            where('alumnoId', '==', this.plan.alumnoId),
            where('activa', '==', true)
          );
          const viejas = await getDocs(q);
          viejas.forEach(docSnap => batch.update(docSnap.ref, { activa: false }));
          batch.set(doc(collection(this.firestore, 'dietas')), datosDieta);
          await batch.commit();
        }
      }

      loading.dismiss();
      this.mostrarToast('Plan guardado exitosamente ✅', 'success');
      this.navCtrl.back();

    } catch (error) {
      console.error(error);
      loading.dismiss();
      this.mostrarToast('Error al guardar. Intenta de nuevo.', 'danger');
    }
  }

  async mostrarToast(m: string, c: string) {
    const toast = await this.toastCtrl.create({
      message:  m,
      duration: 2500,
      color:    c,
      mode:     'ios',
      position: 'top'
    });
    toast.present();
  }
}