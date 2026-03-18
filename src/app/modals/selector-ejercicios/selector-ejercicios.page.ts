import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

// 👇 1. SOLUCIÓN AL BUG: Importamos el servicio correcto que usamos en la Biblioteca
import { EjerciciosService } from 'src/app/services/ejercicios'; 
import { addIcons } from 'ionicons';
import { searchOutline, closeOutline, checkmarkOutline, addCircleOutline, barbellOutline } from 'ionicons/icons';

@Component({
  selector: 'app-selector-ejercicios',
  templateUrl: './selector-ejercicios.page.html',
  styleUrls: ['./selector-ejercicios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SelectorEjerciciosPage implements OnInit {

  todosLosEjercicios: any[] = [];
  filtrados: any[] = [];
  busqueda = '';
  seleccionados: any[] = []; 

  constructor(
    private modalCtrl: ModalController,
    private ejerciciosService: EjerciciosService // 👈 Usamos el servicio correcto
  ) {
    addIcons({ searchOutline, closeOutline, checkmarkOutline, addCircleOutline, barbellOutline });
  }

  ngOnInit() {
    // Cargamos la lista completa (Ahora sí van a aparecer)
    this.todosLosEjercicios = this.ejerciciosService.getEjercicios();
    this.filtrados = [...this.todosLosEjercicios];
  }

  // Buscador en tiempo real 🔍
  buscar(event: any) {
    const query = event.target.value.toLowerCase();
    this.filtrados = this.todosLosEjercicios.filter(e => 
      e.nombre.toLowerCase().includes(query) || e.musculo.toLowerCase().includes(query)
    );
  }

  // Marcar/Desmarcar checkbox ☑️
  toggleSeleccion(ejercicio: any) {
    const existe = this.seleccionados.find(e => e.id === ejercicio.id);
    if (existe) {
      this.seleccionados = this.seleccionados.filter(e => e.id !== ejercicio.id);
    } else {
      this.seleccionados.push(ejercicio);
    }
  }

  // Cerrar sin guardar
  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // Enviar los elegidos al Padre (Crear Rutina)
  confirmar() {
    this.modalCtrl.dismiss(this.seleccionados, 'confirm');
  }

  esSeleccionado(id: string): boolean {
    return !!this.seleccionados.find(e => e.id === id);
  }
}