import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, IonInput, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { people, checkmarkCircle } from 'ionicons/icons';

// 👇 1. Importamos Firebase y AuthService
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
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

  private firestore = inject(Firestore); // Inyectamos Firestore

  codigo = '';
  cajas = [0, 1, 2, 3, 4, 5]; 
  cargando = false;
  
  alumnoId: string | null = null;
  suscripcionAuth: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService // Inyectamos Auth
  ) {
    addIcons({ people, checkmarkCircle });
  }

  ngOnInit() {
    // Obtenemos el ID del alumno que está intentando unirse
    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.alumnoId = user.uid;
      }
    });
  }

  // Pone el foco en el input oculto para abrir el teclado
  setFocus() {
    this.codigoInput.setFocus();
  }

  onCodigoChange(event: any) {
    this.codigo = event.detail.value!.toUpperCase().slice(0, 6);
    if (this.codigo.length === 6) {
      this.unirseAlEquipo();
    }
  }

  async unirseAlEquipo() {
    if (this.codigo.length < 6 || !this.alumnoId) return;

    this.cargando = true;

    try {
      // 1. Buscamos si existe un equipo en Firebase con ese código de 6 letras
      const equiposRef = collection(this.firestore, 'equipos');
      const q = query(equiposRef, where('codigo', '==', this.codigo));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // No existe el código
        this.mostrarToast('Código inválido o caducado.', 'danger');
        this.codigo = ''; 
        this.cargando = false;
        return;
      }

      // 2. Extraemos los datos del equipo encontrado
      const equipoDoc = snapshot.docs[0];
      const dataEquipo = equipoDoc.data();
      const idCoachDelEquipo = dataEquipo['coachId'];

      // 3. ACTUALIZAMOS EL PERFIL DEL ALUMNO EN FIREBASE
      const alumnoRef = doc(this.firestore, 'usuarios', this.alumnoId);
      
      await updateDoc(alumnoRef, {
        equipoId: equipoDoc.id,       // Lo vinculamos al equipo
        coachId: idCoachDelEquipo,    // Lo vinculamos al Coach dueño del equipo
        fechaRegistro: new Date(),    // Guardamos que se unió HOY
        vistoPorCoach: false          // 👇 ¡LA MAGIA DEL PUNTITO ROJO! 🔴
      });

      // (Opcional) Si en tu colección de equipos guardas un array de miembros, también podrías actualizarlo aquí,
      // pero para tu dashboard de coach, lo más importante es actualizar al alumno.

      // 4. Feedback de Éxito
      this.mostrarToast(`¡Bienvenido a ${dataEquipo['nombre']}! 🔥`, 'success');

      // 5. Lo mandamos a su pantalla principal
      this.navCtrl.navigateRoot('/entreno/dashboard');

    } catch (error) {
      console.error('Error al unirse al equipo:', error);
      this.mostrarToast('Hubo un error de conexión.', 'danger');
      this.codigo = '';
    } finally {
      this.cargando = false;
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: color,
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }
}