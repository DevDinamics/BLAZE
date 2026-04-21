import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Share } from '@capacitor/share'; 
import { Filesystem, Directory } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import html2canvas from 'html2canvas';

// 👇 Íconos actualizados para la estética Apple
import { 
  flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, 
  checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline, trophy,
  shareOutline, arrowForwardOutline, chevronForward, time, checkmarkSharp
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
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, 
      checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline, trophy,
      shareOutline, arrowForwardOutline, chevronForward, time, checkmarkSharp
    });
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
    const loading = await this.loadingCtrl.create({
      message: 'Creando obra de arte...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      const element = document.getElementById('shareImageNode');
      
      if (element) {
        // Capturamos el Canvas (la magia de Instagram)
        const canvas = await html2canvas(element, {
          scale: 2.5, // Super alta resolución
          useCORS: true, 
          backgroundColor: '#ffffff' // 👇 Ajustado a blanco para el modo claro
        });

        const base64Data = canvas.toDataURL('image/jpeg', 0.95);
        const fileName = `blaze_logros_${new Date().getTime()}.jpeg`;
        
        // Lo guardamos en el caché del celular
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await loading.dismiss();

        // Lanzamos la acción nativa de compartir
        await Share.share({
          title: 'Mis logros en Blaze',
          text: `🔥 Soy Nivel ${this.nivelActual} con una racha de ${this.stats.rachaDias} días. ¡Únete a Blaze y entrena conmigo!`,
          url: savedFile.uri, 
          dialogTitle: 'Presume tus ganancias'
        });

      } else {
        throw new Error('No se encontró el nodo HTML');
      }

    } catch (error) {
      console.error('Error al compartir', error);
      await loading.dismiss();
      this.mostrarToast('No se pudo generar la imagen.', 'danger');
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
    
    // Aseguramos que el SVG dasharray sea exacto (0 a 100)
    this.porcentajeProgreso = Math.round(Math.min((this.xpEnNivelActual / xpNecesaria) * 100, 100));
    this.xpParaSiguienteNivel = xpMetaDeNivel;
  }

  async mostrarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, color: c, mode: 'ios' });
    t.present();
  }
}