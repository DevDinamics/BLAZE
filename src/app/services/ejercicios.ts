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
    { id: '1', nombre: 'Press de Banca plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press-plano-bar.webp?raw=true' },
    { id: '2', nombre: 'Aperturas banco plano', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Aperturas_con_mancuernas%20.webp?raw=true' },
    { id: '3', nombre: 'Aperturas en banco inclinado', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Aperturas_inclinadas_con_mancuernas.webp?raw=true' },
    { id: '4', nombre: 'Crossover en polea', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Cable-Crossover_.webp?raw=true' },
    { id: '5', nombre: 'Fondos', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Parallel-Dip-Bar_.webp?raw=true' },
    { id: '6', nombre: 'Peck Deck', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Peck-Deck_.webp?raw=true' },
    { id: '7', nombre: 'Press de Banca inclinado', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press%20banca%20inclinado%20con%20mancuernas%20.webp?raw=true' },
    { id: '8', nombre: 'Press inclinado con mancuernas', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press_de_banca_con_mancuernas.webp?raw=true' },
    { id: '9', nombre: 'Press declinado con barra', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press_de_banca_declinado_con_barra.webp?raw=true' },
    { id: '10', nombre: 'Press declinado con mancuerna', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press_de_banca_declinado_con_mancuernas.webp?raw=true' },
    { id: '11', nombre: 'Press de banca en maquina', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press_de_banca_en_m%C3%A1quina_sentado.webp?raw=true' },
    { id: '12', nombre: 'Press inclinado con barra', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Press_de_banca_inclinado_con_barra.webp?raw=true' },
    { id: '13', nombre: 'Flexiones para pecho', musculo: 'Pecho', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pectorales/Push-Ups_.webp?raw=true' },

    // ==========================================
    // 🦇 ESPALDA (13 Ejercicios)
    // ==========================================
    { id: '14', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull-Up_.webp?raw=true' },
    { id: '15', nombre: 'Dominadas Cerradas', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Dominadas_cerradas_.webp?raw=true' },
    { id: '16', nombre: 'Jalón al Pecho Agarre Cerrado Neutro', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Jal%C3%B3n_al_pecho_con_agarre_cerrado.webp?raw=true' },
    { id: '17', nombre: 'Jalón al Pecho Agarre Supino', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Jal%C3%B3n_al_pecho_con_agrarre_invertido.webp?raw=true' },
    { id: '18', nombre: 'Jalón Abierto', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Jal%C3%B3n_con_agarre_ancho.webp?raw=true' },
    { id: '19', nombre: 'Pull Over con Cuerda', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Jal%C3%B3n_en_polea_con_cuerda%20.webp?raw=true' },
    { id: '20', nombre: 'Jalón tras Nuca', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Jal%C3%B3n_tras_nuca%20.webp?raw=true' },
    { id: '21', nombre: 'Dominadas Tras Nuca', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Behind-the-Neck-Pull-Up_.webp?raw=true' },
    { id: '22', nombre: 'Pull Over con Mancuerna', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Pull_over_con_%20mancuerna_.webp?raw=true' },
    { id: '23', nombre: 'Remo con Barra Agarre Supino', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Remo%20inclinado_con_barra_con_agarre_supinado.webp?raw=true' },
    { id: '24', nombre: 'Remo con Barra Agarre Prono', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Remo_con_barra.webp?raw=true' },
    { id: '25', nombre: 'Remo con Mancuerna Unilateral', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Remo_con_mancuerna_a_una_mano.webp?raw=true' },
    { id: '26', nombre: 'Remo T', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Remo_en_barra_T.webp?raw=true' },
    { id: '122', nombre: 'Remo en Polea', musculo: 'Espalda', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/espalda/Remo_en_m%C3%A1quina%20.webp?raw=true' },

    // ==========================================
    // 🦵 PIERNAS (41 Ejercicios)
    // ==========================================
    { id: '27', nombre: 'Abducción con Banda de Resistencia', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Band-Seated-Hip-Abduction_.webp?raw=true' },
    { id: '28', nombre: 'Clamshells con Banda de Resistencia', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Banded-Clams_.webp?raw=true' },
    { id: '29', nombre: 'Sentadilla Búlgara', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Barbell-Bulgarian-Split-Squat_.webp?raw=true' },
    { id: '30', nombre: 'Hip Thrust con Barra', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Barbell-Hip-Thrust_.webp?raw=true' },
    { id: '31', nombre: 'Peso Muerto Rumano', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Barbell-Romanian-Deadlift_.webp?raw=true' },
    { id: '32', nombre: 'Bird Dog', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Bird-Dog_.webp?raw=true' },
    { id: '33', nombre: 'Frog Pump', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Bodyweight-Frog-Pump_.webp?raw=true' },
    { id: '34', nombre: 'Glute Bridge', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Bodyweight-Glute-Bridge_.webp?raw=true' },
    { id: '35', nombre: 'Sentadilla', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Bodyweight-Squat_.png?raw=true' },
    { id: '36', nombre: 'Burpees', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Burpees_.png?raw=true' },
    { id: '37', nombre: 'Donkey Kicks', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Donkey-Kicks_.webp?raw=true' },
    { id: '38', nombre: 'Sentadilla Goblet', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Dumbbell-Goblet-Squat_.webp?raw=true' },
    { id: '39', nombre: 'Peso Muerto Rumano con Mancuerna', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Dumbbell-Romanian-Deadlift_.webp?raw=true' },
    { id: '40', nombre: 'Step Up', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Dumbbell-Step-Up_.webp?raw=true' },
    { id: '41', nombre: 'Fire Hydrant', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Fire-Hydrant_.webp?raw=true' },
    { id: '42', nombre: 'Sentadilla Frontal', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Front-Squat_.webp?raw=true' },
    { id: '43', nombre: 'Buenos Días', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Good-Morning_.webp?raw=true' },
    { id: '44', nombre: 'Groiners', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Groiners_.webp?raw=true' },
    { id: '45', nombre: 'Sentadilla Hack', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Hack-Squat_.webp?raw=true' },
    { id: '46', nombre: 'Sentadilla con Salto', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Jump-Squat_.webp?raw=true' },
    { id: '47', nombre: 'Sentadilla Sumo', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Kettlebell-Sumo-Deadlift_.webp?raw=true' },
    { id: '48', nombre: 'Kettlebell Swing', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Kettlebell-Swing_.webp?raw=true' },
    { id: '49', nombre: 'Knee Tuck Jumps', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Knee-Tuck-Jumps_.webp?raw=true' },
    { id: '50', nombre: 'Extensión de Pierna', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Leg-Extension_.webp?raw=true' },
    { id: '51', nombre: 'Prensa de Pierrnas', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Leg-Press_.webp?raw=true' },
    { id: '52', nombre: 'Desplantes', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Lunge_.webp?raw=true' },
    { id: '53', nombre: 'Curl Femoral', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Lying-Leg-Curl_.webp?raw=true' },
    { id: '54', nombre: 'Abducción en Maquina', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Seated-Hip-Abduction-Machine_.webp?raw=true' },
    { id: '55', nombre: 'Femoral Sentado en Maquina', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Seated-Leg-Curl_.webp?raw=true' },
    { id: '56', nombre: 'Elevación Lateral de Piernas', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Side-Lying-Leg-Raise_.webp?raw=true' },
    { id: '57', nombre: 'Peso Muerto Unilateral', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Single-Leg-Bodyweight-Deadlift_.webp?raw=true' },
    { id: '58', nombre: 'Extensión de Piernas Unilateral', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Single-Leg-Extension_.webp?raw=true' },
    { id: '59', nombre: 'Hip Thrust Unilateral', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Single-Leg-Glute-Bridge_.webp?raw=true' },
    { id: '60', nombre: 'Hip Thrust en Maquina Smith', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Smith-Machine-Hip-Thrust_.webp?raw=true' },
    { id: '61', nombre: 'Sentadilla Libre', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Squat_.webp?raw=true' },
    { id: '62', nombre: 'Abducción en Polea', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Standing-Cable-Abduction_.webp?raw=true' },
    { id: '63', nombre: 'Patada de Glúteo en Polea', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Standing-Cable-Kickback_.webp?raw=true' },
    { id: '64', nombre: 'Sentadilla Isometrica', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/Wall-Sit_.webp?raw=true' },
/*     { id: '65', nombre: 'Ejercicio Pierna 39', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '66', nombre: 'Ejercicio Pierna 40', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
    { id: '67', nombre: 'Ejercicio Pierna 41', musculo: 'Piernas', imagen: 'https://github.com/DevDinamics/baco_de_imagenes_guia/blob/main/pierna/TU_IMAGEN.webp?raw=true' },
 */
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