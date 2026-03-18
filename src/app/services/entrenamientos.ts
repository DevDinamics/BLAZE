import { Injectable } from '@angular/core';

export interface Entrenamiento {
  id: number;
  usuario: string;
  actividad: string;
  fecha: string;
  foto: string; // URL de la foto de prueba
  estado: 'pendiente' | 'aprobado';
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosService {

  // Simulación de base de datos
  private entrenamientos: Entrenamiento[] = [
    {
      id: 1,
      usuario: 'Juan Pérez',
      actividad: 'Crossfit - Murph',
      fecha: 'Hace 2 horas',
      foto: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400',
      estado: 'pendiente'
    },
    {
      id: 2,
      usuario: 'Maria Lopez',
      actividad: 'Leg Day',
      fecha: 'Hace 30 min',
      foto: 'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=400',
      estado: 'pendiente'
    }
  ];

  constructor() { }

  // Función para obtener solo los pendientes
  getPendientes() {
    return this.entrenamientos.filter(e => e.estado === 'pendiente');
  }

  getMiPerfil() {
    return {
      nombre: 'Diego Armando',
      nivel: 5,
      xpActual: 2400,
      xpSiguienteNivel: 3000,
      racha: 12, // días seguidos
      entrenamientos: [
        { id: 10, actividad: 'Pecho y Tríceps', fecha: 'Ayer', estado: 'aprobado', xp: 500 },
        { id: 11, actividad: 'Cardio 30min', fecha: 'Hace 2 días', estado: 'pendiente', xp: 0 }
      ]
    };
  }

  // Función para aprobar un entreno
  aprobarEntrenamiento(id: number) {
    const entreno = this.entrenamientos.find(e => e.id === id);
    if (entreno) {
      entreno.estado = 'aprobado';
      console.log(`Entrenamiento ${id} aprobado. Sumando XP...`);
    }
  }
}