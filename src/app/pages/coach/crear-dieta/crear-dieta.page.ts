import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // 👈 Agregamos ActivatedRoute
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';

// 👇 TODOS LOS ÍCONOS OUTLINE (LIMPIOS)
import { 
  arrowBackOutline, saveOutline, addOutline, trashOutline, restaurantOutline, 
  flameOutline, waterOutline, leafOutline, chevronDownOutline, closeCircleOutline, 
  addCircleOutline, personOutline, closeOutline, pencilOutline, fastFoodOutline
} from 'ionicons/icons';

import { Firestore, collection, query, where, getDocs, addDoc, writeBatch, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-dieta',
  templateUrl: './crear-dieta.page.html',
  styleUrls: ['./crear-dieta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CrearDietaPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // 👈 Inyectamos la ruta para leer el preselectAlumno
  
  coachActual: any = null;
  suscripcionAuth: Subscription | null = null;
  misAlumnos: any[] = [];

  idDietaEdicion: string | null = null;

  plan = {
    nombre: '',
    alumnoId: 'PLANTILLA',
    metaCalorias: 2500,
    objetivo: 'Bajar Grasa',
    metaProte: 200, 
    metaCarbs: 250, 
    metaGrasa: 80,
    metaAgua: 3000
  };

  comidas: any[] = [
    { nombre: 'Desayuno', hora: '08:00', alimentos: [] }
  ];

  objetivos = ['Bajar Grasa', 'Aumentar Músculo', 'Mantenimiento', 'Rendimiento Deportivo'];

  // ==========================================
  // 👇 VARIABLES PARA LOS NUEVOS MODALES 👇
  // ==========================================
  
  // Modal 1: Nueva Comida
  mostrarModalComida = false;
  tempNombreComida = '';

  // Modal 2: Agregar Alimento
  mostrarModalAlimento = false;
  tempAlimento = { nombre: '', cantidad: '', kcal: null as number | null, prote: null as number | null, carbs: null as number | null, grasa: null as number | null };
  indiceComidaParaAlimento = -1; // Para saber a qué comida añadir el alimento

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) {
    // 👇 Registramos todos los iconos outline
    addIcons({ 
      arrowBackOutline, saveOutline, addOutline, trashOutline, restaurantOutline, 
      flameOutline, waterOutline, leafOutline, chevronDownOutline, closeCircleOutline, 
      addCircleOutline, personOutline, closeOutline, pencilOutline, fastFoodOutline
    });

    // Leer si nos mandaron una plantilla para editar o usar
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['plantilla']) {
      const tpl = nav.extras.state['plantilla'];
      const data = tpl.rawDoc;

      this.idDietaEdicion = nav.extras.state['esEdicion'] ? tpl.id : null;

      this.plan.nombre = data.nombrePlan;
      this.plan.objetivo = data.objetivo;
      this.plan.alumnoId = data.alumnoId || 'PLANTILLA'; 
      this.plan.metaCalorias = data.metas.calorias;
      this.plan.metaProte = data.metas.proteina;
      this.plan.metaCarbs = data.metas.carbos;
      this.plan.metaGrasa = data.metas.grasa;
      this.plan.metaAgua = data.metas.agua || 3000;
      
      if (data.comidasBase) {
        this.comidas = JSON.parse(JSON.stringify(data.comidasBase)); 
      }
    }
  }

  ngOnInit() {
    // 🧠 Inteligencia: Si venimos del Directorio de Alumnos, autoselecciona al alumno
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
      const q = query(collection(this.firestore, 'usuarios'), where('coachId', '==', coachId), where('rol', '==', 'alumno'));
      const snapshot = await getDocs(q);
      this.misAlumnos = snapshot.docs.map(doc => ({
        uid: doc.id,
        nombre: doc.data()['nombre']
      }));
    } catch (error) { console.error(error); }
  }

  regresar() { this.navCtrl.back(); }

  // ==========================================
  // 🟢 LÓGICA: NUEVA COMIDA (MODAL)
  // ==========================================
  agregarComida() {
    this.tempNombreComida = '';
    this.mostrarModalComida = true;
  }

  cerrarModalComida() {
    this.mostrarModalComida = false;
  }

  confirmarNuevaComida() {
    if (!this.tempNombreComida) {
      this.mostrarToast('Por favor escribe un nombre.', 'warning');
      return;
    }
    this.comidas.push({ 
      nombre: this.tempNombreComida, 
      hora: '12:00', 
      alimentos: [] 
    });
    this.cerrarModalComida();
  }

  eliminarComida(index: number) { this.comidas.splice(index, 1); }

  // ==========================================
  // 🟢 LÓGICA: AGREGAR ALIMENTO (MODAL)
  // ==========================================
  agregarAlimento(indexComida: number) {
    this.indiceComidaParaAlimento = indexComida;
    this.tempAlimento = { nombre: '', cantidad: '', kcal: null, prote: null, carbs: null, grasa: null };
    this.mostrarModalAlimento = true;
  }

  cerrarModalAlimento() {
    this.mostrarModalAlimento = false;
    this.indiceComidaParaAlimento = -1;
  }

  confirmarNuevoAlimento() {
    const d = this.tempAlimento;
    
    if (!d.nombre) {
      this.mostrarToast('Falta el nombre del alimento.', 'warning');
      return;
    }

    if (this.indiceComidaParaAlimento !== -1) {
      // 👇 Protección anti-null de TypeScript aplicada perfectamente
      this.comidas[this.indiceComidaParaAlimento].alimentos.push({ 
        nombre: d.nombre, 
        cantidad: d.cantidad || '1 porción', 
        kcal: Number(d.kcal) || 0, 
        prote: Number(d.prote) || 0, 
        carbs: Number(d.carbs) || 0, 
        grasa: Number(d.grasa) || 0 
      });
    }
    this.cerrarModalAlimento();
  }

  eliminarAlimento(iComida: number, iAlimento: number) { this.comidas[iComida].alimentos.splice(iAlimento, 1); }

  get totales() {
    let t = { kcal: 0, prote: 0, carbs: 0, grasa: 0 };
    this.comidas.forEach(c => { c.alimentos.forEach((a: any) => { t.kcal += a.kcal; t.prote += a.prote; t.carbs += a.carbs; t.grasa += a.grasa; }); });
    return t;
  }

  async guardarPlan() {
    if (!this.plan.nombre) {
      this.mostrarToast('Ponle nombre al plan.', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();

    try {
      const esPlantilla = this.plan.alumnoId === 'PLANTILLA';

      const comidasFormateadas = this.comidas.map(c => {
        let kcal = 0; let p = 0; let carbs = 0; let g = 0; let nombres: string[] = [];
        c.alimentos.forEach((a: any) => { kcal += a.kcal; p += a.prote; carbs += a.carbs; g += a.grasa; nombres.push(`${a.nombre} (${a.cantidad})`); });
        return {
          tipo: c.nombre, hora: c.hora || '12:00',
          nombre: nombres.join(', ') || 'Libre',
          calorias: kcal, macros: `${p}g P • ${carbs}g C • ${g}g G`,
          imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80',
          completado: false
        };
      });

      const datosDieta = {
        coachId: this.coachActual.uid,
        alumnoId: esPlantilla ? null : this.plan.alumnoId,
        esPlantilla: esPlantilla,
        nombrePlan: this.plan.nombre,
        objetivo: this.plan.objetivo,
        activa: !esPlantilla,
        fechaCreacion: new Date(),
        metas: { calorias: this.plan.metaCalorias, proteina: this.plan.metaProte, carbos: this.plan.metaCarbs, grasa: this.plan.metaGrasa, agua: this.plan.metaAgua },
        comidas: comidasFormateadas,
        comidasBase: this.comidas 
      };

      if (this.idDietaEdicion) {
        const dietaRef = doc(this.firestore, 'dietas', this.idDietaEdicion);
        await updateDoc(dietaRef, datosDieta);
      } else {
        if (esPlantilla) {
          await addDoc(collection(this.firestore, 'dietas'), datosDieta);
        } else {
          const batch = writeBatch(this.firestore);
          const q = query(collection(this.firestore, 'dietas'), where('alumnoId', '==', this.plan.alumnoId), where('activa', '==', true));
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
      this.mostrarToast('Error al guardar', 'danger');
    }
  }

  async mostrarToast(m: string, c: string) {
    const toast = await this.toastCtrl.create({ message: m, duration: 2500, color: c, mode: 'ios', position: 'top' });
    toast.present();
  }
}