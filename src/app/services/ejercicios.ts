import { Injectable } from '@angular/core';

export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: 'Pecho' | 'Espalda' | 'Piernas' | 'Brazo' | 'Cardio' | 'Abs';
  imagen: string;
  video?: string; // Opcional
  dificultad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjerciciosService {

  private ejercicios: Ejercicio[] = [
    {
      id: '1',
      nombre: 'Press de Banca Plano',
      musculo: 'Pecho',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true'
    },
    {
      id: '2',
      nombre: 'Sentadilla con Barra',
      musculo: 'Piernas',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Squat_.webp?raw=true'
    },
    {
      id: '3',
      nombre: 'Dominadas Estrictas',
      musculo: 'Espalda',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true'
    },
    {
      id: '4',
      nombre: 'Curls de Bíceps',
      musculo: 'Brazo',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/Barbell-Curl_.webp?raw=true'
    },
    {
      id: '5',
      nombre: 'Burpees',
      musculo: 'Cardio',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Burpees_.png?raw=true'
    },
    {
      id: '6',
      nombre: 'Plancha Abdominal',
      musculo: 'Abs',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/Plank_.webp?raw=true'
    },

    {
      id: '7',
      nombre: 'sentadilla Goblet',
      musculo: 'Piernas',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Dumbbell-Goblet-Squat_.webp?raw=true'
    },

    {
      id: '8',
      nombre: 'EJERCICIO',
      musculo: 'Piernas',
      imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Kettlebell-Swing_.webp?raw=true'
    },
  ];

  constructor() { }

  getEjercicios() {
    return this.ejercicios;
  }

  // Aquí luego haremos el método para AGREGAR ejercicios
}