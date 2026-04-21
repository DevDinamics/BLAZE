import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 👇 1. Importamos el NavController
import { IonicModule, NavController } from '@ionic/angular'; 
import { addIcons } from 'ionicons';
// 👇 2. Agregamos arrowBack a la lista de íconos
import { searchOutline, notificationsOutline, arrowBack } from 'ionicons/icons';
import { EjerciciosService, Ejercicio } from 'src/app/services/ejercicios';

@Component({
  selector: 'app-ejercicios',
  templateUrl: './ejercicios.page.html',
  styleUrls: ['./ejercicios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EjerciciosPage implements OnInit {

  todosLosEjercicios: Ejercicio[] = [];
  ejerciciosFiltrados: Ejercicio[] = [];
  
  categorias = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'];
  categoriaSeleccionada = 'Todos';

  dificultades = ['Todas', 'Principiante', 'Intermedio', 'Avanzado'];
  dificultadSeleccionada = 'Todas';

  busqueda = '';

  constructor(
    private ejerciciosService: EjerciciosService,
    private navCtrl: NavController // 👇 3. Inyectamos el NavController aquí
  ) {
    // 👇 4. Registramos el nuevo ícono
    addIcons({ searchOutline, notificationsOutline, arrowBack });
  }

  ngOnInit() {
    this.todosLosEjercicios = this.ejerciciosService.getEjercicios();
    this.ejerciciosFiltrados = this.todosLosEjercicios;
  }

  filtrarPorCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
    this.aplicarFiltros();
  }

  filtrarPorDificultad(dif: string) {
    this.dificultadSeleccionada = dif;
    this.aplicarFiltros();
  }

  buscar(event: any) {
    this.busqueda = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.ejerciciosFiltrados = this.todosLosEjercicios.filter(e => {
      const coincideCategoria = this.categoriaSeleccionada === 'Todos' || e.musculo === this.categoriaSeleccionada;
      const coincideDificultad = this.dificultadSeleccionada === 'Todas' || e.dificultad === this.dificultadSeleccionada || !e.dificultad;
      const coincideBusqueda = e.nombre.toLowerCase().includes(this.busqueda);
      
      return coincideCategoria && coincideDificultad && coincideBusqueda;
    });
  }

  // 👇 5. La función mágica para regresar con estilo
  regresar() {
    this.navCtrl.back();
  }

}