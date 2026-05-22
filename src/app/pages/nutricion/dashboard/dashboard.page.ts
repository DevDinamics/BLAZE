import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  NavController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  waterOutline, restaurantOutline, leafOutline, flameOutline,
  addOutline,           // ✅ FIX Bug #4 — era addCircleOutline, el HTML usa add-outline
  checkmarkOutline,     // ✅ FIX Bug #5 — era checkmarkCircleOutline, el HTML usa checkmark-outline
  scanOutline, arrowBackOutline, lockClosedOutline, timeOutline
} from 'ionicons/icons';

import {
  Firestore, collection, query, where, getDocs, doc, updateDoc,
  limit, serverTimestamp           // ✅ MEJORA — serverTimestamp en vez de new Date()
} from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

// ============================================================
// ✅ INTERFACES — Tipado fuerte en vez de any (mejora tesis)
// ============================================================
interface MetasNutricionales {
  calorias: number;
  proteina: number;
  carbos: number;
  grasa: number;
  agua: number;
}

interface MacrosNum {
  proteina: number;
  carbos: number;
  grasa: number;
}

interface Comida {
  tipo: string;
  hora: string;
  nombre: string;
  calorias: number;
  macros: string;
  macrosNum?: MacrosNum;  // ✅ FIX Bug #1 — campo numérico para no parsear strings
  imagen: string;
  completado: boolean;
}

interface Consumo {
  calorias: number;
  proteina: number;
  carbos: number;
  grasa: number;
  agua: number;
}

@Component({
  selector: 'app-nutricion',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    // ✅ FIX Bug #2 — Standalone components en vez de IonicModule legacy
    IonContent, IonIcon, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class NutricionPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);

  cargando = true;
  tienePlan = false;
  suscripcionAuth: Subscription | null = null;

  // ✅ ID del documento de dieta activa — necesario para persistir el agua en Firestore
  private dietaDocId: string | null = null;

  metas: MetasNutricionales = {
    calorias: 2800, proteina: 200, carbos: 300, grasa: 80, agua: 3000
  };

  consumo: Consumo = {
    calorias: 0, proteina: 0, carbos: 0, grasa: 0, agua: 0
  };

  comidas: Comida[] = [
    {
      tipo: 'Desayuno',
      hora: '08:00 AM',
      nombre: 'Omelette de Claras & Avena',
      calorias: 450,
      macros: '30g P • 40g C • 10g G',
      macrosNum: { proteina: 30, carbos: 40, grasa: 10 },  // ✅ campo numérico
      imagen: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=500&q=80',
      completado: false
    },
    {
      tipo: 'Almuerzo',
      hora: '02:00 PM',
      nombre: 'Bowl de Pollo y Quinoa',
      calorias: 650,
      macros: '45g P • 60g C • 15g G',
      macrosNum: { proteina: 45, carbos: 60, grasa: 15 },  // ✅ campo numérico
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
      completado: false
    }
  ];

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      waterOutline, restaurantOutline, leafOutline, flameOutline,
      addOutline, checkmarkOutline, scanOutline, arrowBackOutline,
      lockClosedOutline, timeOutline
    });
  }

  ngOnInit() {
    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.verificarPlanNutricional(user.uid);
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe();
  }

  async verificarPlanNutricional(uid: string) {
    this.cargando = true;
    try {
      const q = query(
        collection(this.firestore, 'dietas'),
        where('alumnoId', '==', uid),
        where('activa', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        this.tienePlan = true;
        const docSnap = snapshot.docs[0];
        this.dietaDocId = docSnap.id;               // ✅ guardamos el ID para persistir agua
        const datosDieta = docSnap.data();

        if (datosDieta['metas'])   this.metas   = datosDieta['metas'];
        if (datosDieta['comidas']) this.comidas  = datosDieta['comidas'];

        // ✅ FIX Bug #3 — restaurar el consumo de agua guardado en Firestore
        if (datosDieta['consumoAgua'] !== undefined) {
          this.consumo.agua = datosDieta['consumoAgua'];
        }

        this.calcularTotales();  // ✅ movido aquí — después de cargar comidas
      } else {
        this.tienePlan = false;
      }
    } catch (error) {
      console.error('Error al buscar dieta:', error);
      this.tienePlan = false;
    } finally {
      this.cargando = false;
    }
  }

  regresar() { this.navCtrl.back(); }

  async toggleComida(index: number) {
    // 1. Cambiamos el estado en la pantalla
    this.comidas[index].completado = !this.comidas[index].completado;
    this.calcularTotales();

    // 2. 💾 GUARDAMOS EN FIREBASE (Esto era lo que faltaba)
    if (this.dietaDocId) {
      try {
        const dietaRef = doc(this.firestore, 'dietas', this.dietaDocId);
        await updateDoc(dietaRef, { comidas: this.comidas });
      } catch (error) {
        console.error("Error guardando la comida:", error);
        // Si se va el internet, lo revertimos para no mentirle al usuario
        this.comidas[index].completado = !this.comidas[index].completado;
        this.calcularTotales();
      }
    }
  }

  // ✅ FIX Bug #3 — agregarAgua ahora persiste en Firestore + feedback de meta cumplida
  async agregarAgua() {
    if (this.consumo.agua >= this.metas.agua) {
      const toast = await this.toastCtrl.create({
        message: '¡Meta de hidratación alcanzada! 💧',
        duration: 2000,
        color: 'primary',
        mode: 'ios',
        position: 'top'
      });
      toast.present();
      return;
    }

    this.consumo.agua = Math.min(this.consumo.agua + 250, this.metas.agua);

    // Persistir en Firestore para que no se pierda al recargar
    if (this.dietaDocId) {
      try {
        await updateDoc(
          doc(this.firestore, 'dietas', this.dietaDocId),
          { consumoAgua: this.consumo.agua }
        );
      } catch (e) {
        console.warn('No se pudo guardar el agua:', e);
      }
    }
  }

  // ✅ FIX Bug #1 — calcularTotales usa macrosNum si existe, parseMacros como fallback
  calcularTotales() {
    let totalCal  = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalGrasa = 0;

    this.comidas.forEach(comida => {
      if (comida.completado) {
        totalCal += comida.calorias;

        if (comida.macrosNum) {
          // ✅ camino primario — datos numéricos limpios
          totalProt  += comida.macrosNum.proteina;
          totalCarbs += comida.macrosNum.carbos;
          totalGrasa += comida.macrosNum.grasa;
        } else {
          // fallback para documentos viejos sin macrosNum
          const macros = this.parseMacros(comida.macros);
          totalProt  += macros.proteina;
          totalCarbs += macros.carbos;
          totalGrasa += macros.grasa;
        }
      }
    });

    this.consumo.calorias = totalCal;
    this.consumo.proteina = totalProt;
    this.consumo.carbos   = totalCarbs;
    this.consumo.grasa    = totalGrasa;
  }

  // ✅ FIX Bug #1 — parseMacros más robusto con regex y soporte para decimales
  parseMacros(textoMacros: string): MacrosNum {
    const matches = textoMacros.match(/[\d.]+/g) ?? [];
    return {
      proteina: parseFloat(matches[0] ?? '0'),
      carbos:   parseFloat(matches[1] ?? '0'),
      grasa:    parseFloat(matches[2] ?? '0')
    };
  }

  // ============================================================
  // ✅ GETTERS — Con Math.min para no pasar 100% (ya estaba bien)
  // ============================================================
  get pCalorias() { return this.metas.calorias ? Math.min(this.consumo.calorias / this.metas.calorias, 1) : 0; }
  get pProteina() { return this.metas.proteina ? Math.min(this.consumo.proteina / this.metas.proteina, 1) : 0; }
  get pCarbos()   { return this.metas.carbos   ? Math.min(this.consumo.carbos   / this.metas.carbos,   1) : 0; }
  get pGrasa()    { return this.metas.grasa    ? Math.min(this.consumo.grasa    / this.metas.grasa,    1) : 0; }
  get pAgua()     { return this.metas.agua     ? Math.min(this.consumo.agua     / this.metas.agua,     1) : 0; }

  // ============================================================
  // ✅ MEJORA PRO — Mensaje motivacional dinámico
  // ============================================================
  get mensajeMotivacional(): string {
    const pct = this.pCalorias;
    if (pct === 0)  return '¡Empieza tu día con energía! 💪';
    if (pct < 0.5)  return 'Buen inicio, sigue así 🔥';
    if (pct < 1)    return '¡Casi completas tu meta! 🎯';
    return '¡Meta cumplida! Excelente disciplina 🏆';
  }

  // ============================================================
  // ✅ MEJORA PRO — Validación de coherencia calórica
  // Demuestra conocimiento nutricional en la tesis
  // ============================================================
  get coherenciaCalórica(): { calsCalculadas: number; diferencia: number; ok: boolean } {
    const calsCalculadas =
      (this.consumo.proteina * 4) +
      (this.consumo.carbos   * 4) +
      (this.consumo.grasa    * 9);
    const diferencia = Math.abs(calsCalculadas - this.consumo.calorias);
    return { calsCalculadas, diferencia, ok: diferencia < 50 };
  }
}