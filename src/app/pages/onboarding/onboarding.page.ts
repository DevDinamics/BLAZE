import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ✅ FIX: Todo Ionic desde UN SOLO lugar — standalone.
// Mezclar '@ionic/angular' con '@ionic/angular/standalone' en el mismo componente
// funciona en localhost (JIT) pero explota silenciosamente en producción (AOT).
import {
  NavController,
  LoadingController,
  ToastController,
  IonContent,
  IonIcon,
  IonModal,
  IonDatetime,
  IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline, personOutline, peopleOutline, scaleOutline,
  barbellOutline, checkmarkCircleOutline, calendarOutline, bodyOutline, medkitOutline,
  chevronBack, chevronForward, caretDown, caretUp, chevronDown
} from 'ionicons/icons';

import { firstValueFrom } from 'rxjs';
// ✅ FIX: Agregamos take(1) para que firstValueFrom nunca se quede colgado
// esperando un valor que en producción puede tardar o no llegar.
import { filter, take } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  // ✅ FIX: IonSpinner agregado — se usa en el HTML pero no estaba importado
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonModal, IonDatetime, IonSpinner]
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
    console.log('🚀 finalizarOnboarding iniciado, paso:', this.pasoActual);

    const loading = await this.loadingCtrl.create({
      message: 'Creando tu perfil BLAZE...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      // ✅ FIX: take(1) garantiza que el observable cierre aunque Firebase
      // tarde en inicializarse — sin esto se queda colgado en producción.
      const user = await firstValueFrom(
        this.authService.user$.pipe(
          filter(u => u !== undefined),
          take(1)
        )
      );

      if (!user) {
        await loading.dismiss();
        this.navCtrl.navigateRoot('/login');
        return;
      }

      const perfilActualizado: any = {
        rol: this.datos.rol,
        foto: this.datos.avatar,
        onboardingComplete: true
      };

      if (this.datos.rol === 'atleta') {
        perfilActualizado.genero = this.datos.genero;
        perfilActualizado.fechaNacimiento = this.datos.fechaNacimiento;
        perfilActualizado.objetivo = this.datos.objetivo;
        perfilActualizado.tieneLesion = this.datos.tieneLesion || false;
        perfilActualizado.detalleLesion = this.datos.tieneLesion ? this.datos.detalleLesion : '';

        // 🛡️ Escudos Anti-NaN
        const edadCalc = this.calcularEdad(this.datos.fechaNacimiento);
        perfilActualizado.edad = isNaN(edadCalc) ? 0 : edadCalc;

        const pesoCalc = Number(this.datos.peso);
        perfilActualizado.peso = isNaN(pesoCalc) ? 0 : pesoCalc;

        const estCalc = Number(this.datos.estatura);
        perfilActualizado.estatura = isNaN(estCalc) ? 0 : estCalc;

      } else {
        perfilActualizado.especialidad = this.datos.especialidad || 'General';
        perfilActualizado.bio = this.datos.bio || 'Coach en BLAZE';
      }

      // Limpieza de nulos o indefinidos
      Object.keys(perfilActualizado).forEach(key => {
        if (perfilActualizado[key] === undefined || perfilActualizado[key] === null) {
          delete perfilActualizado[key];
        }
      });

      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      await setDoc(userRef, perfilActualizado, { merge: true });

      await loading.dismiss();

      const toastExito = await this.toastCtrl.create({
        message: '¡Perfil creado con éxito! 🔥',
        duration: 1500,
        color: 'success',
        position: 'top',
        mode: 'ios'
      });
      await toastExito.present();

      setTimeout(async () => {
        const destino = this.datos.rol === 'coach' ? '/coach/dashboard' : '/entreno';
        console.log(`Navegando a: ${destino}`);

        const viajeExitoso = await this.navCtrl.navigateRoot(destino, {
          animated: true,
          animationDirection: 'forward'
        });

        if (!viajeExitoso) {
          console.warn('Angular bloqueó la navegación. Usando window.location...');
          window.location.href = destino;
        }
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error al guardar onboarding:', error);
      await loading.dismiss();

      const mensajeError = error.message ? error.message : 'Error de conexión con Firebase.';
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