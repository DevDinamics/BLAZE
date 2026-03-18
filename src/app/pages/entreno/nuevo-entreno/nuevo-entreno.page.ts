import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 👇 AQUÍ ESTÁ EL SECRETO: Importa todo esto explícitamente 👇
import { 
  IonicModule, 
  ModalController, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonFooter 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline, camera, cloudUpload, close } from 'ionicons/icons';

@Component({
  selector: 'app-nuevo-entreno',
  templateUrl: './nuevo-entreno.page.html',
  styleUrls: ['./nuevo-entreno.page.scss'],
  standalone: true,
  // 👇 Asegúrate de que IonicModule esté aquí
  imports: [IonicModule, CommonModule, FormsModule] 
})
export class NuevoEntrenoPage implements OnInit {

  constructor(private modalCtrl: ModalController) {
    addIcons({ timeOutline, camera, cloudUpload, close });
  }

  ngOnInit() {
  }

  guardarEntreno() {
    this.modalCtrl.dismiss({ registrado: true });
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

}