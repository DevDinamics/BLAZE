import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; 
import { NavController, ToastController, Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
// 👇 CAMBIO 1: Importamos 'take' de RxJS
import { filter, take } from 'rxjs/operators'; 
import { AuthService } from 'src/app/services/auth';

// 👇 CAMBIO 2: ¡Tus iconos! No los podemos olvidar aquí
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple, mailOutline, lockClosedOutline, eyeOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule],
})
export class AppComponent implements OnInit {
  
  rutaActual: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {
    // Registramos los iconos globalmente para que no desaparezcan
    addIcons({ logoGoogle, logoApple, mailOutline, lockClosedOutline, eyeOutline, arrowForwardOutline });
    this.rastrearRutaActual();
  }

  async ngOnInit() {
    await this.platform.ready();
    this.iniciarVigilanteSeguridad();
  }

  // ==========================================
  // 📍 1. RASTREADOR DE RUTAS
  // ==========================================
  rastrearRutaActual() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActual = event.urlAfterRedirects;
    });
  }

  // ==========================================
  // 🛡️ 2. VIGILANTE GLOBAL DE SESIONES
  // ==========================================
  iniciarVigilanteSeguridad() {
    this.authService.user$.subscribe(async (user) => {
      
      const rutasPublicas = ['/login', '/registro'];
      const esRutaPublica = rutasPublicas.some(ruta => this.rutaActual.includes(ruta));

      if (!user && !esRutaPublica && this.rutaActual !== '') {
        console.warn('🔒 ALERTA: Sesión cerrada en otra pestaña o expirada.');
        this.navCtrl.navigateRoot('/login');
        this.mostrarAlertaExpulsion();
      }

      if (user && esRutaPublica) {
        // 👇 CAMBIO 3: Quitamos el uid porque no lo usabas dentro de la función
        this.redirigirPorRol(); 
      }
    });
  }

  // ==========================================
  // 🚀 3. UTILIDADES DE REDIRECCIÓN Y ALERTAS
  // ==========================================
  async redirigirPorRol() {
    // 👇 CAMBIO 4: Añadimos .pipe(take(1)) para evitar una fuga de memoria
    this.authService.perfilCompleto$.pipe(take(1)).subscribe(perfil => {
      if (perfil) {
        if (perfil['rol'] === 'coach') {
          this.navCtrl.navigateRoot('/coach/dashboard');
        } else {
          this.navCtrl.navigateRoot('/entreno/dashboard');
        }
      }
    });
  }

  async mostrarAlertaExpulsion() {
    const toast = await this.toastCtrl.create({
      message: 'Tu sesión fue cerrada por seguridad 🔒',
      duration: 3500,
      color: 'dark',
      position: 'top',
      mode: 'ios'
    });
    toast.present();
  }
}