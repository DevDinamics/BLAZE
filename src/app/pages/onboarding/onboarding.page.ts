import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, peopleOutline, scaleOutline, barbellOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/services/auth';
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

  // 👇 LISTA DE TUS AVATARES (Ajusta los nombres a las imágenes que tengas)
  // 👇 1. Creamos listas separadas para cada rol
  avataresAtleta = [
    'assets/icon/avatar-h-1.png', 
    'assets/icon/avatar-m-1.png',
    'assets/icon/avatar-h-2.png',
    'assets/icon/avatar-oso.png', // Tu famoso osito 🐻
    'assets/icon/avatar-ninja.png'
  ];

  avataresCoach = [
    'assets/avatar-coach/avatar-hombre-1.png',
    'assets/avatar-coach/avatar-hombre-2.png',
    'assets/avatar-coach/avatar-hombre-3.png',
    'assets/avatar-coach/avatar-mujer-1.png',
    'assets/avatar-coach/avatar-mujer-2.png',
    'assets/avatar-coach/avatar-mujer-3.png'
  ];

  // 👇 2. Creamos una función "Mágica" que decide qué lista entregar
  get avataresDisponibles() {
    return this.datos.rol === 'coach' ? this.avataresCoach : this.avataresAtleta;
  }

  datos: any = {
    rol: '',
    genero: '',
    peso: null,
    objetivo: '',
    especialidad: '',
    bio: '',
    avatar: '' // 👇 Nueva variable para el avatar
  };

  private authSub: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private studentService: StudentService,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ arrowBackOutline, personOutline, peopleOutline, scaleOutline, barbellOutline, checkmarkCircleOutline });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  generarArregloPasos(): number[] {
    return Array(this.totalPasos).fill(0);
  }

  seleccionarRol(rol: string) {
    this.datos.rol = rol;
    // 👇 SUMAMOS 1 PASO EXTRA PARA EL AVATAR: Atleta ahora tiene 5, Coach 3.
    this.totalPasos = rol === 'atleta' ? 5 : 3; 
  }

  puedeAvanzar(): boolean {
    if (this.pasoActual === 1) return this.datos.rol !== '';
    
    // Validaciones Atleta
    if (this.datos.rol === 'atleta') {
      if (this.pasoActual === 2) return this.datos.genero !== '';
      if (this.pasoActual === 3) return this.datos.peso > 0;
      if (this.pasoActual === 4) return this.datos.objetivo !== '';
      if (this.pasoActual === 5) return this.datos.avatar !== ''; // Validar Avatar
    }

    // Validaciones Coach
    if (this.datos.rol === 'coach') {
      if (this.pasoActual === 2) return this.datos.especialidad !== '' && this.datos.bio !== '';
      if (this.pasoActual === 3) return this.datos.avatar !== ''; // Validar Avatar
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

  async finalizarOnboarding() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando tu perfil BLAZE...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      this.authSub = this.authService.user$.subscribe(async (user) => {
        if (user) {
          
          const perfilActualizado = {
            rol: this.datos.rol,
            genero: this.datos.genero || null,
            peso: this.datos.peso ? Number(this.datos.peso) : null,
            objetivo: this.datos.objetivo || null,
            especialidad: this.datos.especialidad || null,
            bio: this.datos.bio || null,
            foto: this.datos.avatar, // 👇 AQUÍ GUARDAMOS EL AVATAR COMO SU FOTO OFICIAL
            onboardingCompletado: true
          };

          await this.studentService.actualizarPerfil(user.uid, perfilActualizado);
          loading.dismiss();

          if (this.datos.rol === 'coach') {
            this.navCtrl.navigateRoot('/coach/dashboard');
          } else {
            this.navCtrl.navigateRoot('/entreno'); 
          }
        }
      });
    } catch (error) {
      console.error('Error al guardar onboarding:', error);
      loading.dismiss();
    }
  }
}