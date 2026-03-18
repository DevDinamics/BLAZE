import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';

// 👇 Íconos en versión Outline (Limpios)
import { 
  waterOutline, restaurantOutline, leafOutline, flameOutline, addCircleOutline, 
  checkmarkCircleOutline, scanOutline, arrowBackOutline, lockClosedOutline 
} from 'ionicons/icons';

import { Firestore, collection, query, where, getDocs, limit } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nutricion',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NutricionPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);

  cargando = true;
  tienePlan = false; 
  suscripcionAuth: Subscription | null = null;

  metas = { calorias: 2800, proteina: 200, carbos: 300, grasa: 80, agua: 3000 };
  consumo = { calorias: 0, proteina: 0, carbos: 0, grasa: 0, agua: 0 };

  comidas: any[] = [
    {
      tipo: 'Desayuno',
      hora: '08:00 AM',
      nombre: 'Omelette de Claras & Avena',
      calorias: 450,
      macros: '30g P • 40g C • 10g G',
      imagen: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=500&q=80',
      completado: false 
    },
    {
      tipo: 'Almuerzo',
      hora: '02:00 PM',
      nombre: 'Bowl de Pollo y Quinoa',
      calorias: 650,
      macros: '45g P • 60g C • 15g G',
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
      completado: false
    }
  ];

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    // 👇 Registramos los íconos Outline
    addIcons({ waterOutline, restaurantOutline, leafOutline, flameOutline, addCircleOutline, checkmarkCircleOutline, scanOutline, arrowBackOutline, lockClosedOutline });
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
        const datosDieta = snapshot.docs[0].data();
        
        if (datosDieta['metas']) this.metas = datosDieta['metas'];
        if (datosDieta['comidas']) this.comidas = datosDieta['comidas'];
      } else {
        this.tienePlan = false;
      }
    } catch (error) {
      console.error("Error al buscar dieta:", error);
      this.tienePlan = false;
    } finally {
      this.cargando = false;
      this.calcularTotales();
    }
  }

  regresar() { this.navCtrl.back(); }

  toggleComida(index: number) {
    this.comidas[index].completado = !this.comidas[index].completado;
    this.calcularTotales();
  }

  agregarAgua() {
    if (this.consumo.agua < this.metas.agua) {
      this.consumo.agua += 250; 
    }
  }

  calcularTotales() {
    let totalCal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalGrasa = 0;

    this.comidas.forEach(comida => {
      if (comida.completado) {
        const macros = this.parseMacros(comida.macros);
        totalCal += comida.calorias;
        totalProt += macros.proteina;
        totalCarbs += macros.carbos;
        totalGrasa += macros.grasa;
      }
    });

    this.consumo.calorias = totalCal;
    this.consumo.proteina = totalProt;
    this.consumo.carbos = totalCarbs;
    this.consumo.grasa = totalGrasa;
  }

  parseMacros(textoMacros: string) {
    const partes = textoMacros.split('•').map(p => parseInt(p.replace(/[^0-9]/g, '')));
    return {
      proteina: partes[0] || 0,
      carbos: partes[1] || 0,
      grasa: partes[2] || 0
    };
  }

  get pCalorias() { return this.metas.calorias ? Math.min(this.consumo.calorias / this.metas.calorias, 1) : 0; }
  get pProteina() { return this.metas.proteina ? Math.min(this.consumo.proteina / this.metas.proteina, 1) : 0; }
  get pCarbos() { return this.metas.carbos ? Math.min(this.consumo.carbos / this.metas.carbos, 1) : 0; }
  get pGrasa() { return this.metas.grasa ? Math.min(this.consumo.grasa / this.metas.grasa, 1) : 0; }
}