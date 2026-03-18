import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  // EN EL FUTURO: Esto vendrá de Firebase
  // AHORA: Usamos una lista PRO estática para probar
  private ejercicios = [
    { id: '1', nombre: 'Press de Banca Plano', musculo: 'Pecho', imagen: 'https://media.tenor.com/images/841094037b3d1797587824853039e316/tenor.gif' },
    { id: '2', nombre: 'Sentadilla con Barra', musculo: 'Pierna', imagen: 'https://i.pinimg.com/originals/f3/73/42/f3734268b8ba97e3ba63f03a6c42964e.gif' },
    { id: '3', nombre: 'Dominadas Estrictas', musculo: 'Espalda', imagen: 'https://media.tenor.com/images/3f5509c6933189871790407a166060c4/tenor.gif' },
    { id: '4', nombre: 'Curls de Bíceps', musculo: 'Brazo', imagen: 'https://i.pinimg.com/originals/69/44/0a/69440a430588647008b8b939f40882d9.gif' },
    { id: '5', nombre: 'Peso Muerto', musculo: 'Pierna', imagen: 'https://media.tenor.com/images/50849925695034604d53823432025176/tenor.gif' },
  ];

  getEjercicios() {
    return this.ejercicios;
  }
}