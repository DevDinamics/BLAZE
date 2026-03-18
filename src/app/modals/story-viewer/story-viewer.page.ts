import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.page.html',
  styleUrls: ['./story-viewer.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StoryViewerPage implements OnInit {

  @Input() historia: any; // Recibimos la historia completa

  cargando = true;
  tiempoTranscurrido = '1h'; // Calcularemos esto real
  reaccionAnimada: string | null = null;
  autoCloseTimeout: any;

  constructor(private modalCtrl: ModalController) {
    addIcons({ close });
  }

  ngOnInit() {
    this.calcularTiempo();
    // Cierre automático en 5 segundos (como Instagram)
    this.autoCloseTimeout = setTimeout(() => {
      this.cerrar();
    }, 5000);
  }

  imagenCargada() {
    this.cargando = false;
  }

  cerrar() {
    clearTimeout(this.autoCloseTimeout);
    this.modalCtrl.dismiss();
  }

  reaccionar(emoji: string) {
    // 1. Mostrar animación
    this.reaccionAnimada = emoji;
    
    // 2. Aquí conectaríamos con Firebase para guardar el like (Paso siguiente)
    console.log('Reaccionaste con:', emoji);

    // 3. Ocultar animación después de 1s
    setTimeout(() => {
      this.reaccionAnimada = null;
    }, 1000);
  }

  calcularTiempo() {
    if (!this.historia?.fecha) return;
    
    // Convertir Timestamp de Firebase a JS Date
    const fecha = this.historia.fecha.seconds 
      ? new Date(this.historia.fecha.seconds * 1000) 
      : new Date(this.historia.fecha);

    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHrs > 0) {
      this.tiempoTranscurrido = `${diffHrs}h`;
    } else {
      this.tiempoTranscurrido = `${diffMins}m`;
    }
  }
}