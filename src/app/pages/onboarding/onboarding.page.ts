import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { IonContent, IonIcon, IonModal, IonDatetime } from '@ionic/angular/standalone'; 

import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, personOutline, peopleOutline, scaleOutline, 
  barbellOutline, checkmarkCircleOutline, calendarOutline, bodyOutline, medkitOutline,
  chevronBack, chevronForward, caretDown, caretUp, chevronDown
} from 'ionicons/icons';

import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonModal, IonDatetime]
})
export class OnboardingPage implements OnDestroy {

  private firestore = inject(Firestore);

  pasoActual: number = 1;
  totalPasos: number = 1;
  edadMostrada: number | null = null;

  avataresAtleta = [
    'assets/avatar-entreno/avatar_h_1.png',
    'assets/avatar-entreno/avatar_h_2.png',
    'assets/avatar-entreno/avatar_h_3.png',
    'assets/avatar-entreno/avatar_m_1.png',
    'assets/avatar-entreno/avatar_m_2.png',
    'assets/avatar-entreno/avatar_m_3.png'
  ];

  avataresCoach = [
    'assets/avatar-coach/avatar-hombre-1.png',
    'assets/avatar-coach/avatar-hombre-2.png',
    'assets/avatar-coach/avatar-hombre-3.png',
    'assets/avatar-coach/avatar-mujer-1.png',
    'assets/avatar-coach/avatar-mujer-2.png',
    'assets/avatar-coach/avatar-mujer-3.png'
  ];

  get avataresDisponibles() {
    return this.datos.rol === 'coach' ? this.avataresCoach : this.avataresAtleta;
  }

  datos: any = {
    rol: '',
    genero: '',
    fechaNacimiento: '',
    peso: null,
    estatura: null,
    objetivo: '',
    tieneLesion: null,
    detalleLesion: '',
    especialidad: '',
    bio: '',
    avatar: ''
  };

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      arrowBackOutline, personOutline, peopleOutline, scaleOutline, 
      barbellOutline, checkmarkCircleOutline, calendarOutline, bodyOutline, medkitOutline,
      chevronBack, chevronForward, caretDown, caretUp, chevronDown
    });
  }

  ngOnDestroy() {}

  generarArregloPasos(): number[] {
    return Array(this.totalPasos).fill(0);
  }

  seleccionarRol(rol: string) {
    this.datos.rol = rol;
    this.totalPasos = rol === 'atleta' ? 7 : 3;
  }

  puedeAvanzar(): boolean {
    if (this.pasoActual === 1) return this.datos.rol !== '';

    if (this.datos.rol === 'atleta') {
      if (this.pasoActual === 2) return this.datos.genero !== '';
      if (this.pasoActual === 3) return this.datos.fechaNacimiento !== '';
      if (this.pasoActual === 4) return this.datos.peso > 0 && this.datos.estatura > 0;
      if (this.pasoActual === 5) return this.datos.objetivo !== '';
      if (this.pasoActual === 6) {
        if (this.datos.tieneLesion === null) return false;
        if (this.datos.tieneLesion && this.datos.detalleLesion.trim() === '') return false;
        return true;
      }
      if (this.pasoActual === 7) return this.datos.avatar !== '';
    }

    if (this.datos.rol === 'coach') {
      if (this.pasoActual === 2) return this.datos.especialidad !== '' && this.datos.bio !== '';
      if (this.pasoActual === 3) return this.datos.avatar !== '';
    }

    return true;
  }

  pasoSiguiente() {
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    } else {
      this.finalizarOnboarding();
    }
  }

  pasoAnterior() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  actualizarEdad() {
    if (this.datos.fechaNacimiento) {
      this.edadMostrada = this.calcularEdad(this.datos.fechaNacimiento);
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  }

  async finalizarOnboarding() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando tu perfil BLAZE...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      const user = await firstValueFrom(
        this.authService.user$.pipe(filter(u => u !== undefined))
      );

      if (!user) {
        await loading.dismiss();
        this.navCtrl.navigateRoot('/login');
        return;
      }

      const perfilActualizado: any = {
        rol: this.datos.rol,
        foto: this.datos.avatar,
        onboardingCompletado: true
      };

      if (this.datos.rol === 'atleta') {
        perfilActualizado.genero = this.datos.genero;
        perfilActualizado.fechaNacimiento = this.datos.fechaNacimiento;
        perfilActualizado.edad = this.calcularEdad(this.datos.fechaNacimiento);
        perfilActualizado.peso = Number(this.datos.peso) || 0;
        perfilActualizado.estatura = Number(this.datos.estatura) || 0;
        perfilActualizado.objetivo = this.datos.objetivo;
        perfilActualizado.tieneLesion = this.datos.tieneLesion || false;
        perfilActualizado.detalleLesion = this.datos.tieneLesion ? this.datos.detalleLesion : '';
      } else {
        perfilActualizado.especialidad = this.datos.especialidad || 'General';
        perfilActualizado.bio = this.datos.bio || 'Coach en BLAZE';
      }

      Object.keys(perfilActualizado).forEach(key => {
        if (perfilActualizado[key] === undefined) {
          delete perfilActualizado[key];
        }
      });

      // Guardamos en Firebase Directo
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userRef, perfilActualizado);

      await loading.dismiss();

      // 👇 AQUÍ ESTÁ LA SOLUCIÓN DEL CONGELAMIENTO: Un Toast de éxito y un pequeño retraso
      const toastExito = await this.toastCtrl.create({
        message: '¡Bienvenido a BLAZE! 🔥',
        duration: 1500,
        color: 'success',
        position: 'top',
        mode: 'ios'
      });
      await toastExito.present();

      // Esperamos 1.5 segundos para que la base de datos se ponga de acuerdo con el guardia de Angular
      setTimeout(() => {
        if (this.datos.rol === 'coach') {
          window.location.href = '/coach/dashboard';
        } else {
          window.location.href = '/entreno';
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error al guardar onboarding:', error);
      await loading.dismiss();
      
      const mensajeError = error.message ? error.message : 'Error de conexión con la base de datos.';
      const toast = await this.toastCtrl.create({
        message: 'Error: ' + mensajeError,
        duration: 5000,
        color: 'danger',
        position: 'top',
        mode: 'ios'
      });
      await toast.present();
    }
  }
}