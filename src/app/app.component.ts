import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 CAMBIO 
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; 
// (Los servicios y controladores sí se quedan en @ionic/angular)
import { NavController, ToastController, Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule],
})
export class AppComponent implements OnInit {
  
  // Guardamos la ruta actual para saber dónde está el usuario
  rutaActual: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {
    this.rastrearRutaActual();
  }

  async ngOnInit() {
    await this.platform.ready();
    this.iniciarVigilanteSeguridad();
  }

  // ==========================================
  // 📍 1. RASTREADOR DE RUTAS
  // ==========================================
  // Mantiene actualizada la variable rutaActual cada vez que el usuario navega
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
      
      // Definimos cuáles son las pantallas donde un usuario NO logueado puede estar
      const rutasPublicas = ['/login', '/registro'];
      const esRutaPublica = rutasPublicas.some(ruta => this.rutaActual.includes(ruta));

      // 🚨 CASO A: NO HAY USUARIO, PERO ESTÁ EN UNA ZONA PRIVADA (Dashboard, etc.)
      if (!user && !esRutaPublica && this.rutaActual !== '') {
        console.warn('🔒 ALERTA: Sesión cerrada en otra pestaña o expirada.');
        
        // 1. Expulsión inmediata
        this.navCtrl.navigateRoot('/login');
        
        // 2. Notificación visual en la pestaña que fue expulsada
        this.mostrarAlertaExpulsion();
      }

      // ✅ CASO B: HAY USUARIO, PERO ESTÁ EN EL LOGIN/REGISTRO
      // (Previene que alguien logueado intente entrar al login escribiendo la URL)
      if (user && esRutaPublica) {
        // Redirigimos silenciosamente a su dashboard correspondiente
        this.redirigirPorRol(user.uid);
      }
    });
  }

  // ==========================================
  // 🚀 3. UTILIDADES DE REDIRECCIÓN Y ALERTAS
  // ==========================================
  async redirigirPorRol(uid: string) {
    // Si ya está logueado y abre /login en otra pestaña, lo mandamos a su panel
    this.authService.perfilCompleto$.subscribe(perfil => {
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