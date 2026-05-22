import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router'; 
import { AuthService } from 'src/app/services/auth';
import { StudentService } from 'src/app/services/student';
import { addIcons } from 'ionicons';

// 👇 Íconos limpios (Outline)
import { homeOutline, shareSocialOutline, timeOutline, barbellOutline, flameOutline, ribbonOutline, trophyOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ResumenPage implements OnInit {

  resumen = {
    nombreRutina: 'Entrenamiento',
    tiempo: '00:00',
    totalKilos: 0,
    xpGanada: 0,
    nivelUsuario: 1,
    progresoNivel: 0 
  };

  xpDisplay = 0; 
  guardadoExitoso = false;

  constructor(
    private navCtrl: NavController,
    private router: Router, 
    private authService: AuthService,
    private studentService: StudentService,
    private toastCtrl: ToastController 
  ) {
    addIcons({ homeOutline, shareSocialOutline, timeOutline, barbellOutline, flameOutline, ribbonOutline, trophyOutline, alertCircleOutline });

    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras.state) {
      const datosRecibidos = navigation.extras.state['datos'];
      this.resumen = { ...this.resumen, ...datosRecibidos };
      
      this.procesarProgreso();
    }
  }

  ngOnInit() {
    this.animarXP();
  }

  async procesarProgreso() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        try {
          const perfil: any = await this.studentService.obtenerMiPerfil(user.uid);
          
          const xpAnterior = perfil.xpTotal || 0;
          const nuevaXP = xpAnterior + this.resumen.xpGanada;
          const nuevoNivel = Math.floor(nuevaXP / 1000) + 1;
          const xpEnNivelActual = nuevaXP % 1000; 
          
          this.resumen.nivelUsuario = nuevoNivel;
          this.resumen.progresoNivel = xpEnNivelActual / 1000;

          // 👇 EL TRUCO: Convertimos "MM:SS" a un número total de minutos
          let minutosEntrenados = 0;
          if (this.resumen.tiempo && this.resumen.tiempo.includes(':')) {
             const partes = this.resumen.tiempo.split(':');
             const minutos = parseInt(partes[0], 10) || 0;
             const segundos = parseInt(partes[1], 10) || 0;
             // Sumamos los minutos y si los segundos pasan de 30, redondeamos hacia arriba
             minutosEntrenados = minutos + (segundos > 30 ? 1 : 0);
          }

          // 👇 AHORA SÍ, ENVIAMOS EL CAMPO 'duracionMinutos' PARA QUE LO LEA EL DASHBOARD
          await this.studentService.registrarTerminoRutina(user.uid, {
            ...this.resumen,
            fecha: new Date(),
            nivelAlcanzado: nuevoNivel,
            duracionMinutos: minutosEntrenados 
          });

          this.guardadoExitoso = true;

        } catch (error: any) {
          console.error("Error guardando:", error);
          this.mostrarError(error.message || 'Error al guardar el entreno');
        }
      }
    });
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje, 
      duration: 4000,
      position: 'top', 
      mode: 'ios',
      color: 'danger',
      icon: 'alert-circle-outline',
      cssClass: 'apple-pill-toast toast-danger' 
    });
    toast.present();
  }

  animarXP() {
    const duration = 2000; 
    const steps = 50;
    const increment = (this.resumen.xpGanada || 0) / steps; 
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      this.xpDisplay += increment;
      if (this.xpDisplay >= this.resumen.xpGanada) {
        this.xpDisplay = this.resumen.xpGanada;
        clearInterval(timer);
      }
    }, intervalTime);
  }

  volverAlHome() {
    this.navCtrl.navigateRoot('/entreno'); 
  }

  compartir() {
    console.log("📸 Generando Story para Instagram...");
  }
}