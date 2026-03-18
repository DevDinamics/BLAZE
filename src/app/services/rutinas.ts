import { Injectable } from '@angular/core';

export interface Rutina {
  id: number;
  nombre: string;
  enfoque: 'Hipertrofia' | 'Resistencia' | 'Fuerza' | 'Pérdida de Peso';
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion: number; // en minutos
  ejerciciosCount: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutinasService {

  private rutinas: Rutina[] = [
    {
      id: 1,
      nombre: 'Destrucción de Pierna',
      enfoque: 'Hipertrofia',
      nivel: 'Avanzado',
      duracion: 90,
      ejerciciosCount: 6,
      imagen: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 2,
      nombre: 'Pecho y Tríceps Explosivo',
      enfoque: 'Fuerza',
      nivel: 'Intermedio',
      duracion: 60,
      ejerciciosCount: 5,
      imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 3,
      nombre: 'Cardio HIIT Quemagrasa',
      enfoque: 'Pérdida de Peso',
      nivel: 'Principiante',
      duracion: 25,
      ejerciciosCount: 4,
      imagen: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=500&q=80'
    }
  ];

  constructor() { }

  getRutinas() {
    return this.rutinas;
  }
}