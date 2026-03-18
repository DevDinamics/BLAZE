import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
// 👇 USAMOS ESTE ICONO SEGURO
import { close, ribbon, time, school, chatboxEllipses, checkmarkCircle, chatbubbleEllipses } from 'ionicons/icons';

@Component({
  selector: 'app-ver-perfil-coach',
  templateUrl: './ver-perfil-coach.component.html',
  styleUrls: ['./ver-perfil-coach.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class VerPerfilCoachComponent implements OnInit {

  @Input() coach: any;

  constructor(private modalCtrl: ModalController) {
    // 👇 REGISTRAMOS chatboxEllipses
    addIcons({ close, ribbon, time, school, chatboxEllipses, checkmarkCircle, chatbubbleEllipses });
  }

  ngOnInit() {
    if(!this.coach) {
      this.coach = { nombre: 'Coach', titulo: 'FitGo Team' };
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}