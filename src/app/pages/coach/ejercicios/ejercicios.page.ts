import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, notificationsOutline } from 'ionicons/icons';
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
  
  // 👇 1. Categorías (Músculos)
  categorias = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'];
  categoriaSeleccionada = 'Todos';

  // 👇 2. Dificultades (Segunda fila de filtros)
  dificultades = ['Todas', 'Principiante', 'Intermedio', 'Avanzado'];
  dificultadSeleccionada = 'Todas';

  busqueda = '';

  constructor(private ejerciciosService: EjerciciosService) {
    addIcons({ searchOutline, notificationsOutline });
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
      // Filtro 1: Categoría (Músculo)
      const coincideCategoria = this.categoriaSeleccionada === 'Todos' || e.musculo === this.categoriaSeleccionada;
      
      // Filtro 2: Dificultad (Si tu modelo no tiene dificultad, esto lo ignora y no rompe la app)
      const coincideDificultad = this.dificultadSeleccionada === 'Todas' || e.dificultad === this.dificultadSeleccionada || !e.dificultad;
      
      // Filtro 3: Buscador
      const coincideBusqueda = e.nombre.toLowerCase().includes(this.busqueda);
      
      return coincideCategoria && coincideDificultad && coincideBusqueda;
    });
  }

}