import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, rocket } from 'ionicons/icons';

@Component({
  selector: 'app-upload-preview',
  templateUrl: './upload-preview.page.html',
  styleUrls: ['./upload-preview.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UploadPreviewPage {

  @Input() imagePath: string = ''; // Recibimos la ruta de la imagen

  constructor(private modalCtrl: ModalController) {
    addIcons({ close, rocket });
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirmarSubida() {
    // Devolvemos 'confirm: true' para indicar que el usuario quiere subirla
    this.modalCtrl.dismiss({ confirm: true }, 'confirm');
  }
}