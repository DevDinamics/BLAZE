import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, onSnapshot, collection, query, getDocs, orderBy, where } from '@angular/fire/firestore';
import { Share } from '@capacitor/share'; 
import { Filesystem, Directory } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import html2canvas from 'html2canvas';

import { 
  flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, 
  checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline, trophy,
  shareOutline, arrowForwardOutline, chevronForward, time, checkmarkSharp,
  logoInstagram, downloadOutline
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
    entrenosCompletados: 0,
    rachaDias: 0,
    kilosLevantados: 0,
    minutosEntrenados: 0,
    tendenciaEntrenos: '+0', 
    tendenciaKilos: '+0kg'  
  };

  semana = [
    { dia: 'L', completado: false, fecha: '' },
    { dia: 'M', completado: false, fecha: '' },
    { dia: 'M', completado: false, fecha: '' },
    { dia: 'J', completado: false, fecha: '' },
    { dia: 'V', completado: false, fecha: '' },
    { dia: 'S', completado: false, fecha: '' },
    { dia: 'D', completado: false, fecha: '' },
  ];

  cargandoMetricas = true;

  modalPreviewAbierto = false;
  imagenPreviewBase64: string = '';
  imagenPreviewUri: string = '';

  avatarBase64: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      flame, barbellOutline, trophyOutline, trendingUpOutline, calendarOutline, timeOutline, 
      checkmarkCircleOutline, medalOutline, shareSocialOutline, arrowUpOutline, trophy,
      shareOutline, arrowForwardOutline, chevronForward, time, checkmarkSharp, logoInstagram, downloadOutline
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.cargarPerfilReal(user.uid);
        this.calcularMetricas(user.uid); 
      }
    });
    this.configurarFechasSemanaActual();
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
        this.prepararAvatarBase64();
      }
    });
  }

  async prepararAvatarBase64() {
    let urlFoto = this.perfil?.foto;
    
    if (!urlFoto) {
      const nombreCodificado = this.perfil?.nombre ? encodeURIComponent(this.perfil.nombre) : 'User';
      urlFoto = `https://ui-avatars.com/api/?name=${nombreCodificado}&background=f57c00&color=fff`;
    }

    try {
      const urlSegura = urlFoto.includes('?') ? `${urlFoto}&_t=${new Date().getTime()}` : `${urlFoto}?_t=${new Date().getTime()}`;
      const response = await fetch(urlSegura);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        this.avatarBase64 = reader.result as string; 
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.warn('No se pudo convertir el avatar a base64', error);
      this.avatarBase64 = urlFoto; 
    }
  }

  async calcularMetricas(uid: string) {
    this.cargandoMetricas = true;
    try {
      const historialRef = collection(this.firestore, 'solicitudes_aprobacion');
      
      // 👇 1. QUITAMOS EL orderBy PARA EVITAR EL BLOQUEO DE FIREBASE
      const q = query(
        historialRef, 
        where('alumnoId', '==', uid),
        where('estado', '==', 'aprobado')
      );
      
      const querySnapshot = await getDocs(q);
      
      // 👇 2. GUARDAMOS LOS DOCUMENTOS EN UN ARREGLO TEMPORAL
      let entrenos: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let fechaRegistro: Date = new Date();

        // Extraemos la fecha (Soporta Timestamp de Firebase)
        if (data['fecha'] && data['fecha'].seconds) {
           fechaRegistro = new Date(data['fecha'].seconds * 1000);
        } else if (typeof data['fecha'] === 'string') {
           fechaRegistro = new Date(data['fecha']); 
        }

        entrenos.push({
          ...data,
          fechaReal: fechaRegistro
        });
      });

      // 👇 3. ORDENAMOS LAS FECHAS MANUALMENTE (De más reciente a más antigua)
      entrenos.sort((a, b) => b.fechaReal.getTime() - a.fechaReal.getTime());

      let totalEntrenos = 0;
      let totalKilos = 0;
      let totalMinutos = 0;
      let rachaActual = 0;
      let ultimaFechaEntreno: Date | null = null;
      let fechasEntrenadas: string[] = [];

      // 👇 4. AHORA SÍ, CALCULAMOS TODO CON LOS DATOS ORDENADOS
      entrenos.forEach((data) => {
        totalEntrenos++;
        totalKilos += (data['totalKilos'] || 0); 
        totalMinutos += (data['duracionMinutos'] || 0); // Si no tienes este campo, se quedará en 0

        const fechaRegistro = data.fechaReal;
        const fechaFormat = fechaRegistro.toISOString().split('T')[0];
        fechasEntrenadas.push(fechaFormat);

        if (!ultimaFechaEntreno) {
          ultimaFechaEntreno = fechaRegistro;
          rachaActual = 1;
        } else {
          const diferenciaDias = this.diasEntreFechas(fechaRegistro, ultimaFechaEntreno);
          if (diferenciaDias === 1) {
            rachaActual++;
            ultimaFechaEntreno = fechaRegistro;
          }
        }
      });

      if (ultimaFechaEntreno) {
         const hoy = new Date();
         if (this.diasEntreFechas(ultimaFechaEntreno, hoy) > 1) {
            rachaActual = 0; 
         }
      }

      // ASIGNAMOS LOS VALORES FINALES
      this.stats.entrenosCompletados = totalEntrenos;
      this.stats.kilosLevantados = totalKilos;
      this.stats.minutosEntrenados = totalMinutos;
      this.stats.rachaDias = rachaActual;

      this.mapearSemanaVisual(fechasEntrenadas);

    } catch (error) {
      console.error('Error calculando métricas:', error);
    } finally {
      this.cargandoMetricas = false;
    }
  }

  configurarFechasSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diferenciaLunes = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); 
    const lunes = new Date(hoy.setDate(diferenciaLunes));

    for (let i = 0; i < 7; i++) {
      const fechaDia = new Date(lunes);
      fechaDia.setDate(lunes.getDate() + i);
      this.semana[i].fecha = fechaDia.toISOString().split('T')[0];
    }
  }

  mapearSemanaVisual(fechasEntrenadas: string[]) {
    this.semana.forEach(dia => {
      if (fechasEntrenadas.includes(dia.fecha)) {
        dia.completado = true;
      } else {
        dia.completado = false;
      }
    });
  }

  diasEntreFechas(fechaAntigua: Date, fechaReciente: Date) {
    const f1 = new Date(fechaAntigua.getFullYear(), fechaAntigua.getMonth(), fechaAntigua.getDate());
    const f2 = new Date(fechaReciente.getFullYear(), fechaReciente.getMonth(), fechaReciente.getDate());
    const unDia = 1000 * 60 * 60 * 24;
    const diferenciaMs = f2.getTime() - f1.getTime();
    return Math.round(diferenciaMs / unDia);
  }

  async compartirLogro() {
    const loading = await this.loadingCtrl.create({
      message: 'Diseñando tu Story...', spinner: 'crescent', mode: 'ios'
    });
    await loading.present();

    try {
      const element = document.getElementById('shareImageNode');
      if (element) {
        
        const canvas = await html2canvas(element, { 
          scale: 1.5, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          allowTaint: true
        });
        
        this.imagenPreviewBase64 = canvas.toDataURL('image/jpeg', 0.95);
        const fileName = `blaze_story_${new Date().getTime()}.jpeg`;
        
        const savedFile = await Filesystem.writeFile({
          path: fileName, 
          data: this.imagenPreviewBase64, 
          directory: Directory.Cache
        });

        this.imagenPreviewUri = savedFile.uri;
        
        await loading.dismiss();
        this.modalPreviewAbierto = true;

      } else {
        throw new Error('No se encontró el nodo HTML');
      }
    } catch (error) {
      console.error('Error al compartir', error);
      await loading.dismiss();
      this.mostrarToast('No se pudo generar la imagen.', 'danger');
    }
  }

  cerrarPreview() {
    this.modalPreviewAbierto = false;
  }

  async compartirNativo() {
    try {
      await Share.share({
        title: 'Mis logros en Blaze',
        text: `🔥 Nivel ${this.nivelActual} | Racha: ${this.stats.rachaDias} días. ¡Únete a mi equipo en Blaze!`,
        url: this.imagenPreviewUri, 
        dialogTitle: 'Compartir en Instagram'
      });
    } catch(err) {
      console.error(err);
    }
  }

  descargarImagen() {
    const a = document.createElement('a');
    a.href = this.imagenPreviewBase64;
    a.download = `blaze_story_${new Date().getTime()}.jpeg`;
    a.click();
    this.mostrarToast('Imagen guardada con éxito', 'success');
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
    
    this.porcentajeProgreso = Math.round(Math.min((this.xpEnNivelActual / xpNecesaria) * 100, 100));
    this.xpParaSiguienteNivel = xpMetaDeNivel;
  }

  async mostrarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, color: c, mode: 'ios' });
    t.present();
  }
}