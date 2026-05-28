import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonIcon, IonSpinner, NavController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chatbubblesOutline } from 'ionicons/icons';

import { AuthService } from 'src/app/services/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonIcon, IonSpinner, CommonModule, FormsModule]
})
export class ChatPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  
  cargando = true;
  suscripcionAuth: Subscription | null = null;
  
  miCoach: any = null; // Guardará los datos del Coach asignado

  constructor(
    private authService: AuthService,
    private navCtrl: NavController
  ) {
    addIcons({ chevronForwardOutline, chatbubblesOutline });
  }

  ngOnInit() {
    this.suscripcionAuth = this.authService.user$.subscribe(async user => {
      if (user) {
        await this.cargarMiCoach(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe();
  }

  async cargarMiCoach(alumnoUid: string) {
    this.cargando = true;
    try {
      // 1. Buscamos el documento del alumno para ver quién es su coach
      const alumnoRef = doc(this.firestore, `usuarios/${alumnoUid}`);
      const alumnoSnap = await getDoc(alumnoRef);
      
      if (alumnoSnap.exists()) {
        const data = alumnoSnap.data();
        const coachId = data['coachId'];

        // 2. Si tiene un coach asignado, traemos los datos de ese coach
        if (coachId) {
          const coachRef = doc(this.firestore, `usuarios/${coachId}`);
          const coachSnap = await getDoc(coachRef);
          
          if (coachSnap.exists()) {
            this.miCoach = { id: coachId, ...coachSnap.data() };
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar el coach:', error);
    } finally {
      this.cargando = false;
    }
  }

  abrirChat() {
    if (this.miCoach) {
      // Navegamos a la sala de mensajes, pasando los datos del coach
      this.navCtrl.navigateForward(['/sala-chat'], {
        state: { contacto: this.miCoach }
      });
    }
  }
}