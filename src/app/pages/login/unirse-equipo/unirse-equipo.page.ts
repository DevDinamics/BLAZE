import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, IonInput, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { people } from 'ionicons/icons';

@Component({
  selector: 'app-unirse-equipo',
  templateUrl: './unirse-equipo.page.html',
  styleUrls: ['./unirse-equipo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UnirseEquipoPage implements OnInit {
  
  @ViewChild('codigoInput', { static: false }) codigoInput!: IonInput;

  codigo = '';
  cajas = [0, 1, 2, 3, 4, 5]; // Array auxiliar para dibujar las 6 cajas
  cargando = false;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    addIcons({ people });
  }

  ngOnInit() {}

  // Pone el foco en el input oculto para abrir el teclado
  setFocus() {
    this.codigoInput.setFocus();
  }

  onCodigoChange(event: any) {
    // Limitamos a números y mayúsculas si quieres
    this.codigo = event.detail.value!.toUpperCase().slice(0, 6);
    
    // Auto-submit si llega a 6 caracteres
    if (this.codigo.length === 6) {
      this.unirseAlEquipo();
    }
  }

  async unirseAlEquipo() {
    if (this.codigo.length < 6) return;

    this.cargando = true;

    // SIMULACIÓN DE BACKEND (Aquí llamarías a tu API)
    setTimeout(async () => {
      this.cargando = false;

      // Código válido de ejemplo: "PRO123"
      if (this.codigo === 'PRO123') {
        
        // 1. Guardar que el usuario ya tiene equipo
        localStorage.setItem('hasTeam', 'true'); // O actualizar tu servicio de usuario

        // 2. Feedback de éxito
        const toast = await this.toastCtrl.create({
          message: '¡Bienvenido al Team Espartanos! 🔥',
          duration: 2000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        toast.present();

        // 3. Ir al Dashboard
        this.navCtrl.navigateRoot('/entreno/dashboard');

      } else {
        // Código inválido
        const toast = await this.toastCtrl.create({
          message: 'Código inválido. Intenta de nuevo.',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
        this.codigo = ''; // Limpiar
      }
    }, 1500);
  }
}
