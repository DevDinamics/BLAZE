import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, IonInput, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { people, checkmarkCircle } from 'ionicons/icons';

// 👇 Agregamos arrayUnion para meter al alumno en el equipo
import { Firestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-unirse-equipo',
  templateUrl: './unirse-equipo.page.html',
  styleUrls: ['./unirse-equipo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UnirseEquipoPage implements OnInit {
  
  @ViewChild('codigoInput', { static: false }) codigoInput!: IonInput;

  private firestore = inject(Firestore);

  codigo = '';
  cajas = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Aumentamos a 9 para TEAM-XXXX
  cargando = false;
  
  alumnoId: string | null = null;
  suscripcionAuth: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService 
  ) {
    addIcons({ people, checkmarkCircle });
  }

  ngOnInit() {
    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.alumnoId = user.uid;
      }
    });
  }

  setFocus() {
    this.codigoInput.setFocus();
  }

  onCodigoChange(event: any) {
    // 🛡️ CORRECCIÓN: Quitamos el slice de 6 para que acepte el código largo
    this.codigo = event.detail.value!.toUpperCase().trim();
    
    // Si llega a la longitud de tu código (9 en este caso), disparamos automático
    if (this.codigo.length === 9) {
      this.unirseAlEquipo();
    }
  }

  async unirseAlEquipo() {
    if (!this.codigo || !this.alumnoId) return;

    this.cargando = true;

    try {
      const equiposRef = collection(this.firestore, 'equipos');
      const q = query(equiposRef, where('codigo', '==', this.codigo));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this.mostrarToast('Código inválido. Revisa mayúsculas y guiones.', 'danger');
        this.cargando = false;
        return;
      }

      const equipoDoc = snapshot.docs[0];
      const dataEquipo = equipoDoc.data();
      const idCoachDelEquipo = dataEquipo['coachId'];

      // ==========================================
      // 🤝 EL VÍNCULO BIDIRECCIONAL (LA CLAVE)
      // ==========================================

      // 1. Actualizamos el perfil del ALUMNO (Para que el Coach lo encuentre en el radar)
      const alumnoRef = doc(this.firestore, 'usuarios', this.alumnoId);
      await updateDoc(alumnoRef, {
        equipoId: equipoDoc.id,
        coachId: idCoachDelEquipo,
        vistoPorCoach: false,
        rol: 'alumno' // Nos aseguramos de que deje de ser 'pendiente'
      });

      // 2. Metemos el ID del alumno en la lista de MIEMBROS del equipo
      const equipoRef = doc(this.firestore, 'equipos', equipoDoc.id);
      await updateDoc(equipoRef, {
        miembros: arrayUnion(this.alumnoId)
      });

      this.mostrarToast(`¡Bienvenido a ${dataEquipo['nombre']}! 🔥`, 'success');
      this.navCtrl.navigateRoot('/entreno/dashboard');

    } catch (error) {
      console.error('Error:', error);
      this.mostrarToast('Error al conectar con el cuartel.', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: color
    });
    toast.present();
  }
}