import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, personOutline, peopleOutline, scaleOutline, 
  barbellOutline, checkmarkCircleOutline, calendarOutline, bodyOutline, medkitOutline 
} from 'ionicons/icons';

// ✅ Usamos authState directamente — es más confiable que user$ de AuthService
// porque garantiza que emite null (sin sesión) o User (con sesión), nunca undefined.
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { StudentService } from 'src/app/services/student';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OnboardingPage implements OnDestroy {

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
    private auth: Auth,
    private navCtrl: NavController,
    private studentService: StudentService,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      arrowBackOutline, personOutline, peopleOutline, scaleOutline, 
      barbellOutline, checkmarkCircleOutline, calendarOutline, bodyOutline, medkitOutline 
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
      // ✅ authState() emite null o User — nunca queda colgado como user$
      // filter(u => u !== null) espera hasta tener un usuario real confirmado
      const user = await firstValueFrom(
        authState(this.auth).pipe(filter(u => u !== null))
      );

      if (!user) {
        await loading.dismiss();
        this.navCtrl.navigateRoot('/login');
        return;
      }

      const perfilActualizado: any = {
        rol: this.datos.rol,
        foto: this.datos.avatar,
        onboardingCompletado: true  // 🔑 Esta bandera desbloquea el acceso
      };

      if (this.datos.rol === 'atleta') {
        perfilActualizado.genero = this.datos.genero;
        perfilActualizado.fechaNacimiento = this.datos.fechaNacimiento;
        perfilActualizado.edad = this.calcularEdad(this.datos.fechaNacimiento);
        perfilActualizado.peso = Number(this.datos.peso);
        perfilActualizado.estatura = Number(this.datos.estatura);
        perfilActualizado.objetivo = this.datos.objetivo;
        perfilActualizado.tieneLesion = this.datos.tieneLesion;
        perfilActualizado.detalleLesion = this.datos.tieneLesion ? this.datos.detalleLesion : '';
      } else {
        perfilActualizado.especialidad = this.datos.especialidad;
        perfilActualizado.bio = this.datos.bio;
      }

      await this.studentService.actualizarPerfil(user.uid, perfilActualizado);

      await loading.dismiss();

      if (this.datos.rol === 'coach') {
        this.navCtrl.navigateRoot('/coach/dashboard');
      } else {
        this.navCtrl.navigateRoot('/entreno');
      }

    } catch (error) {
      console.error('Error al guardar onboarding:', error);
      await loading.dismiss();
    }
  }
}