import { Component, OnInit, OnDestroy, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { CoachService } from 'src/app/services/coach'; 
import { AuthService } from 'src/app/services/auth';   
import { addIcons } from 'ionicons';

// 👇 1. ÍCONOS MINIMALISTAS (OUTLINE)
import { 
  checkmarkCircleOutline, closeCircleOutline, timeOutline, personCircleOutline, 
  trophyOutline, flameOutline, barbellOutline, peopleOutline, clipboardOutline, 
  statsChartOutline, keyOutline, restaurantOutline, refreshOutline, settingsOutline 
} from 'ionicons/icons';

import { 
  Firestore, collection, query, where, onSnapshot, 
  doc, updateDoc, increment, orderBy 
} from '@angular/fire/firestore';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CoachDashboardPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);

  segmentoActual = 'pendientes';
  pendientes: any[] = [];
  ranking: any[] = []; 
  suscripcionSolicitudes: any; 
  suscripcionRanking: any;
  uidCoach: string | null = null;
  intervaloTiempo: any; 

  constructor(
    private coachService: CoachService, 
    private authService: AuthService,   
    private toastCtrl: ToastController,
    private navCtrl: NavController 
  ) {
    // 👇 Registramos los nuevos íconos finos
    addIcons({ 
      checkmarkCircleOutline, closeCircleOutline, timeOutline, personCircleOutline, 
      trophyOutline, flameOutline, barbellOutline, peopleOutline, clipboardOutline, 
      statsChartOutline, keyOutline, restaurantOutline, refreshOutline, settingsOutline 
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.uidCoach = user.uid;
        this.cargarSolicitudesReales();
        this.cargarRankingReal();
        
        this.intervaloTiempo = setInterval(() => {
          this.actualizarTiemposEnVivo();
        }, 60000);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionSolicitudes) this.suscripcionSolicitudes(); 
    if (this.suscripcionRanking) this.suscripcionRanking();
    if (this.intervaloTiempo) clearInterval(this.intervaloTiempo);
  }

  cargarSolicitudesReales() {
    if (!this.uidCoach) return;
    const q = query(collection(this.firestore, 'solicitudes_aprobacion'), where('coachId', '==', this.uidCoach), where('estado', '==', 'pendiente'), orderBy('fecha', 'desc'));
    this.suscripcionSolicitudes = onSnapshot(q, (snapshot) => {
      this.pendientes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          usuario: data['nombreAlumno'] || 'Alumno',
          actividad: data['nombreRutina'] || 'Entrenamiento Completado',
          foto: data['fotoAlumno'] || 'https://i.pravatar.cc/150?u=' + doc.id,
          fechaRaw: data['fecha'], 
          fecha: this.calcularTiempoTranscurrido(data['fecha']), 
          tipo: 'entreno',
          xpReclamada: data['xpReclamada'] || 500, 
          alumnoId: data['alumnoId'],
          ...data
        };
      });
    });
  }

  calcularTiempoTranscurrido(fechaFirestore: any): string {
    if (!fechaFirestore) return 'un momento';
    let fecha: Date = fechaFirestore.toDate ? fechaFirestore.toDate() : new Date(fechaFirestore);
    const diferenciaMs = new Date().getTime() - fecha.getTime();
    const minutos = Math.floor(diferenciaMs / 60000);

    if (minutos < 1) return 'ahora mismo';
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    return `${dias}d`;
  }

  actualizarTiemposEnVivo() {
    this.pendientes = this.pendientes.map(item => ({ ...item, fecha: this.calcularTiempoTranscurrido(item.fechaRaw) }));
  }

  async autorizar(item: any) {
    try {
      const alumnoRef = doc(this.firestore, 'usuarios', item.alumnoId);
      await updateDoc(alumnoRef, { xpTotal: increment(item.xpReclamada || 500), xpSemanal: increment(item.xpReclamada || 500) });
      const solicitudRef = doc(this.firestore, 'solicitudes_aprobacion', item.id);
      await updateDoc(solicitudRef, { estado: 'aprobado' });
      this.mostrarToast(`¡XP otorgada a ${item.usuario}!`, 'success');
    } catch (e) { this.mostrarToast('Error al aprobar', 'danger'); }
  }

  async rechazar(item: any) {
    try {
      const solicitudRef = doc(this.firestore, 'solicitudes_aprobacion', item.id);
      await updateDoc(solicitudRef, { estado: 'rechazado' });
      this.mostrarToast('Entrenamiento rechazado', 'medium');
    } catch (e) { this.mostrarToast('Error al rechazar', 'danger'); }
  }

  cargarRankingReal() {
    if (!this.uidCoach) return;
    const q = query(collection(this.firestore, 'usuarios'), where('coachId', '==', this.uidCoach), where('rol', '==', 'alumno'), orderBy('xpTotal', 'desc'));
    this.suscripcionRanking = onSnapshot(q, (snapshot) => {
      let todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.ranking = todos.filter((user: any) => user.xpTotal > 0);
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const t = await this.toastCtrl.create({ message: mensaje, duration: 2500, color: color, mode: 'ios' });
    t.present();
  }

  irARutinas() { this.navCtrl.navigateForward('/coach/rutinas'); }
  ignorar(id: any) { this.pendientes = this.pendientes.filter(p => p.id !== id); }
  async renovar(id: any) { this.mostrarToast('Notificación enviada', 'success'); }
}