import { Injectable } from '@angular/core';

export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: 'Pecho' | 'Espalda' | 'Piernas' | 'Brazo' | 'Cardio' | 'Abs' | 'Hombros';
  imagen: string;
  video?: string; // Opcional
  dificultad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjerciciosService {

  private ejercicios: Ejercicio[] = [
    
    // ==========================================
    // 🏋️‍♂️ PECHO (13 Ejercicios)
    // ==========================================
    { id: '1', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '2', nombre: 'Aperturas banco plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Aperturas_con_mancuernas%20.webp?raw=true' },
    { id: '3', nombre: 'Aperturas en banco inclinado', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Aperturas_inclinadas_con_mancuernas.webp?raw=true' },
    { id: '4', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '5', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '6', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '7', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '8', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '9', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '10', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '11', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '12', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '13', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },

    // ==========================================
    // 🦇 ESPALDA (13 Ejercicios)
    // ==========================================
    { id: '14', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '15', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '16', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '17', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '18', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '19', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '20', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '21', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '22', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '23', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '24', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '25', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '26', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },

    // ==========================================
    // 🦵 PIERNAS (41 Ejercicios)
    // ==========================================
    { id: '27', nombre: 'Sentadilla con Barra', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Squat_.webp?raw=true' },
    { id: '28', nombre: 'Sentadilla Goblet', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Dumbbell-Goblet-Squat_.webp?raw=true' },
    { id: '29', nombre: 'Kettlebell Swing', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Kettlebell-Swing_.webp?raw=true' },
    { id: '30', nombre: 'Ejercicio Pierna 4', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '31', nombre: 'Ejercicio Pierna 5', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '32', nombre: 'Ejercicio Pierna 6', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '33', nombre: 'Ejercicio Pierna 7', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '34', nombre: 'Ejercicio Pierna 8', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '35', nombre: 'Ejercicio Pierna 9', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '36', nombre: 'Ejercicio Pierna 10', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '37', nombre: 'Ejercicio Pierna 11', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '38', nombre: 'Ejercicio Pierna 12', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '39', nombre: 'Ejercicio Pierna 13', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '40', nombre: 'Ejercicio Pierna 14', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '41', nombre: 'Ejercicio Pierna 15', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '42', nombre: 'Ejercicio Pierna 16', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '43', nombre: 'Ejercicio Pierna 17', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '44', nombre: 'Ejercicio Pierna 18', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '45', nombre: 'Ejercicio Pierna 19', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '46', nombre: 'Ejercicio Pierna 20', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '47', nombre: 'Ejercicio Pierna 21', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '48', nombre: 'Ejercicio Pierna 22', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '49', nombre: 'Ejercicio Pierna 23', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '50', nombre: 'Ejercicio Pierna 24', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '51', nombre: 'Ejercicio Pierna 25', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '52', nombre: 'Ejercicio Pierna 26', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '53', nombre: 'Ejercicio Pierna 27', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '54', nombre: 'Ejercicio Pierna 28', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '55', nombre: 'Ejercicio Pierna 29', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '56', nombre: 'Ejercicio Pierna 30', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '57', nombre: 'Ejercicio Pierna 31', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '58', nombre: 'Ejercicio Pierna 32', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '59', nombre: 'Ejercicio Pierna 33', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '60', nombre: 'Ejercicio Pierna 34', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '61', nombre: 'Ejercicio Pierna 35', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '62', nombre: 'Ejercicio Pierna 36', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '63', nombre: 'Ejercicio Pierna 37', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '64', nombre: 'Ejercicio Pierna 38', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '65', nombre: 'Ejercicio Pierna 39', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '66', nombre: 'Ejercicio Pierna 40', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '67', nombre: 'Ejercicio Pierna 41', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },

    // ==========================================
    // 💪 BRAZO (Bíceps/Tríceps) (27 Ejercicios)
    // ==========================================
    { id: '68', nombre: 'Curls de Bíceps', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/Barbell-Curl_.webp?raw=true' },
    { id: '69', nombre: 'Ejercicio Brazo 2', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '70', nombre: 'Ejercicio Brazo 3', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '71', nombre: 'Ejercicio Brazo 4', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '72', nombre: 'Ejercicio Brazo 5', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '73', nombre: 'Ejercicio Brazo 6', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '74', nombre: 'Ejercicio Brazo 7', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '75', nombre: 'Ejercicio Brazo 8', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '76', nombre: 'Ejercicio Brazo 9', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '77', nombre: 'Ejercicio Brazo 10', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '78', nombre: 'Ejercicio Brazo 11', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '79', nombre: 'Ejercicio Brazo 12', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '80', nombre: 'Ejercicio Brazo 13', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '81', nombre: 'Ejercicio Brazo 14', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '82', nombre: 'Ejercicio Brazo 15', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '83', nombre: 'Ejercicio Brazo 16', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '84', nombre: 'Ejercicio Brazo 17', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '85', nombre: 'Ejercicio Brazo 18', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '86', nombre: 'Ejercicio Brazo 19', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '87', nombre: 'Ejercicio Brazo 20', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '88', nombre: 'Ejercicio Brazo 21', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '89', nombre: 'Ejercicio Brazo 22', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '90', nombre: 'Ejercicio Brazo 23', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '91', nombre: 'Ejercicio Brazo 24', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '92', nombre: 'Ejercicio Brazo 25', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '93', nombre: 'Ejercicio Brazo 26', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },
    { id: '94', nombre: 'Ejercicio Brazo 27', musculo: 'Brazo', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/bicepcs/TU_IMAGEN.webp?raw=true' },

    // ==========================================
    // 🍫 ABDOMINALES (8 Ejercicios)
    // ==========================================
    { id: '95', nombre: 'Plancha Abdominal', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/Plank_.webp?raw=true' },
    { id: '96', nombre: 'Ejercicio Abs 2', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '97', nombre: 'Ejercicio Abs 3', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '98', nombre: 'Ejercicio Abs 4', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '99', nombre: 'Ejercicio Abs 5', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '100', nombre: 'Ejercicio Abs 6', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '101', nombre: 'Ejercicio Abs 7', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },
    { id: '102', nombre: 'Ejercicio Abs 8', musculo: 'Abs', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/abdominales/TU_IMAGEN.webp?raw=true' },

    // ==========================================
    // 🏃‍♂️ HOMBROS (19 Ejercicios)
    // ==========================================
    { id: '103', nombre: 'Ejercicio Hombro 1', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '104', nombre: 'Ejercicio Hombro 2', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '105', nombre: 'Ejercicio Hombro 3', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '106', nombre: 'Ejercicio Hombro 4', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '107', nombre: 'Ejercicio Hombro 5', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '108', nombre: 'Ejercicio Hombro 6', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '109', nombre: 'Ejercicio Hombro 7', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '110', nombre: 'Ejercicio Hombro 8', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '111', nombre: 'Ejercicio Hombro 9', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '112', nombre: 'Ejercicio Hombro 10', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '113', nombre: 'Ejercicio Hombro 11', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '114', nombre: 'Ejercicio Hombro 12', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '115', nombre: 'Ejercicio Hombro 13', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '116', nombre: 'Ejercicio Hombro 14', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '117', nombre: 'Ejercicio Hombro 15', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '118', nombre: 'Ejercicio Hombro 16', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '119', nombre: 'Ejercicio Hombro 17', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '120', nombre: 'Ejercicio Hombro 18', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },
    { id: '121', nombre: 'Ejercicio Hombro 19', musculo: 'Hombros', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/hombros/TU_IMAGEN.webp?raw=true' },

    // ==========================================
    // 🫀 CARDIO / FULL BODY
    // ==========================================
    { id: '122', nombre: 'Burpees', musculo: 'Cardio', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Burpees_.png?raw=true' }

  ];

  constructor() { }

  getEjercicios() {
    return this.ejercicios;
  }

  // Aquí luego haremos el método para AGREGAR ejercicios
}