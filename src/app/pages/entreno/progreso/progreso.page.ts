import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Share } from '@capacitor/share'; 
import { addIcons } from 'ionicons';

// 👇 Íconos limpios para el modo claro
import { 
  flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, 
  checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.page.html',
  styleUrls: ['./progreso.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProgresoPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  
  perfil: any = null;
  suscripcionPerfil: any;

  nivelActual: number = 1;
  xpParaSiguienteNivel: number = 1000;
  xpEnNivelActual: number = 0;
  porcentajeProgreso: number = 0;

  stats = {
    entrenosCompletados: 12,
    rachaDias: 3,
    kilosLevantados: 4500,
    minutosEntrenados: 540,
    tendenciaEntrenos: '+2',
    tendenciaKilos: '+150kg'
  };

  semana = [
    { dia: 'L', completado: true },
    { dia: 'M', completado: true },
    { dia: 'M', completado: false },
    { dia: 'J', completado: true },
    { dia: 'V', completado: false },
    { dia: 'S', completado: false },
    { dia: 'D', completado: false },
  ];

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    // Registramos los íconos
    addIcons({ flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.cargarPerfilReal(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionPerfil) this.suscripcionPerfil();
  }

  cargarPerfilReal(uid: string) {
    const perfilRef = doc(this.firestore, 'usuarios', uid);
    this.suscripcionPerfil = onSnapshot(perfilRef, (docSnap) => {
      if (docSnap.exists()) {
        this.perfil = docSnap.data();
        this.calcularNivel(this.perfil.xpTotal || 0);
      }
    });
  }

  async compartirLogro() {
    try {
      const xp = this.perfil?.xpTotal || 0;
      await Share.share({
        title: '¡Mi progreso en Blaze!',
        text: `🔥 ¡Acabo de alcanzar el Nivel ${this.nivelActual} con ${xp} XP en mi entrenamiento! ¿Puedes superarme?`,
        url: 'https://blazefit.app', 
        dialogTitle: 'Comparte tu Nivel'
      });
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: '¡Nivel copiado al portapapeles!',
        duration: 2000,
        color: 'success',
        icon: 'checkmark-circle-outline',
        mode: 'ios',
        position: 'top'
      });
      toast.present();
    }
  }

  calcularNivel(xpTotal: number) {
    const limitesNiveles = [0, 1000, 2500, 4500, 7000, 10000, 15000];
    let nivel = 1;
    let xpBaseDeNivel = 0;
    let xpMetaDeNivel = limitesNiveles[1];

    for (let i = 1; i < limitesNiveles.length; i++) {
      if (xpTotal >= limitesNiveles[i]) {
        nivel = i + 1;
        xpBaseDeNivel = limitesNiveles[i];
        xpMetaDeNivel = limitesNiveles[i + 1] || limitesNiveles[i] * 1.5; 
      } else {
        break;
      }
    }

    this.nivelActual = nivel;
    this.xpEnNivelActual = xpTotal - xpBaseDeNivel;
    const xpNecesaria = xpMetaDeNivel - xpBaseDeNivel;
    this.porcentajeProgreso = Math.min((this.xpEnNivelActual / xpNecesaria) * 100, 100);
    this.xpParaSiguienteNivel = xpMetaDeNivel;
  }
}