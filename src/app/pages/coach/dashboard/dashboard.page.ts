import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core'; // 👇 1. Importamos NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { 
  IonContent, IonIcon, IonSegment, IonSegmentButton, 
  IonLabel, ToastController, NavController 
} from '@ionic/angular/standalone'; 

import { CoachService } from 'src/app/services/coach'; 
import { AuthService } from 'src/app/services/auth';   
import { addIcons } from 'ionicons';

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
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonIcon, IonSegment, IonSegmentButton, IonLabel
  ]
})
export class CoachDashboardPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  private ngZone = inject(NgZone); // 👇 2. Inyectamos NgZone para despertar a Angular

  iconSettings = settingsOutline;
  iconBarbell = barbellOutline;
  iconClipboard = clipboardOutline;
  iconRestaurant = restaurantOutline;
  iconKey = keyOutline;
  iconCheck = checkmarkCircleOutline;
  iconTime = timeOutline;
  iconClose = closeCircleOutline;
  iconRefresh = refreshOutline;
  iconTrophy = trophyOutline;
  iconFlame = flameOutline;

  segmentoActual = 'pendientes';
  pendientes: any[] = [];
  ranking: any[] = []; 
  
  suscripcionSolicitudes: any; 
  suscripcionRanking: any;
  suscripcionPerfil: any;

  uidCoach: string | null = null;
  coachFoto: string = ''; 
  intervaloTiempo: any; 

  totalAlumnos: number = 0; 
  tieneNuevosAlumnos: boolean = false; 

  constructor(
    private coachService: CoachService, 
    private authService: AuthService,   
    private toastCtrl: ToastController,
    private navCtrl: NavController 
  ) {
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
        this.cargarPerfilCoach();
        this.cargarSolicitudesReales();
        this.cargarRankingReal();
        
        this.intervaloTiempo = setInterval(() => {
          this.ngZone.run(() => { // 👇 Obligamos a actualizar los tiempos
            this.actualizarTiemposEnVivo();
          });
        }, 60000);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionSolicitudes) this.suscripcionSolicitudes(); 
    if (this.suscripcionRanking) this.suscripcionRanking();
    if (this.suscripcionPerfil) this.suscripcionPerfil();
    if (this.intervaloTiempo) clearInterval(this.intervaloTiempo);
  }

  cargarPerfilCoach() {
    if (!this.uidCoach) return;
    const coachRef = doc(this.firestore, 'usuarios', this.uidCoach);
    this.suscripcionPerfil = onSnapshot(coachRef, (docSnap) => {
      this.ngZone.run(() => { // 👇 NgZone aquí
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.coachFoto = data['foto'] || ''; 
        }
      });
    });
  }

  cargarSolicitudesReales() {
    if (!this.uidCoach) return;
    const q = query(collection(this.firestore, 'solicitudes_aprobacion'), 
              where('coachId', '==', this.uidCoach), 
              where('estado', '==', 'pendiente'), 
              orderBy('fecha', 'desc'));
              
    this.suscripcionSolicitudes = onSnapshot(q, (snapshot) => {
      this.ngZone.run(() => { // 👇 NgZone aquí
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
    
    // 👇 SOLUCIÓN: Buscamos solo por 1 campo para no romper a Firebase.
    // Todos los que tengan mi coachId, me pertenecen.
    const q = query(
      collection(this.firestore, 'usuarios'), 
      where('coachId', '==', this.uidCoach)
    );
    
    this.suscripcionRanking = onSnapshot(q, (snapshot) => {
      this.ngZone.run(() => { 
        // 1. Extraemos a todos los usuarios que arrojó la base de datos
        let todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 2. Filtramos en memoria para asegurarnos de que sean alumnos
        let soloAlumnos = todos.filter((user: any) => user.rol === 'alumno' || user.rol === 'atleta');
        // 3. Actualizamos nuestras variables
        this.totalAlumnos = soloAlumnos.length; 
        
        // 4. La lógica del puntito rojo
        this.tieneNuevosAlumnos = soloAlumnos.some((user: any) => user.vistoPorCoach === false);

        // 🕵️‍♀️ EL RADAR
        console.log('--- RADAR DE ALUMNOS (VERSIÓN SMART) ---');
        console.log('Total de alumnos filtrados:', this.totalAlumnos);
        console.log('¿Debe prender el puntito?:', this.tieneNuevosAlumnos);
      });
    }, (error) => {
      console.error("🔥 Error crítico en el Radar:", error);
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