import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { IonicModule, NavController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';

import { 
  arrowBackOutline, searchOutline, personOutline, scaleOutline, bodyOutline, 
  fitnessOutline, closeOutline, barbellOutline, restaurantOutline, starOutline,
  mailOutline, calendarOutline, flagOutline 
} from 'ionicons/icons';

// 👇 1. Agregamos writeBatch y doc a los imports de Firestore
import { Firestore, collection, query, where, getDocs, writeBatch, doc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-alumnos',
  templateUrl: './mis-alumnos.page.html',
  styleUrls: ['./mis-alumnos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MisAlumnosPage implements OnInit, OnDestroy {

  private firestore = inject(Firestore);
  private router = inject(Router); 
  
  cargando = true;
  suscripcionAuth: Subscription | null = null;
  coachId: string | null = null;

  todosLosAlumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  textoBusqueda = '';

  mostrarExpediente = false;
  alumnoSeleccionado: any = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ 
      arrowBackOutline, searchOutline, personOutline, scaleOutline, bodyOutline, 
      fitnessOutline, closeOutline, barbellOutline, restaurantOutline, starOutline,
      mailOutline, calendarOutline, flagOutline
    });
  }

  ngOnInit() {
    this.suscripcionAuth = this.authService.user$.subscribe(user => {
      if (user) {
        this.coachId = user.uid;
        this.cargarAlumnos();
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcionAuth) this.suscripcionAuth.unsubscribe();
  }

  async cargarAlumnos() {
    if (!this.coachId) return;
    this.cargando = true;

    try {
      const q = query(
        collection(this.firestore, 'usuarios'), 
        where('coachId', '==', this.coachId), 
        where('rol', '==', 'alumno')
      );
      
      const snapshot = await getDocs(q);
      
      this.todosLosAlumnos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id, 
          nombre: data['nombre'] || 'Sin Nombre',
          apellido: data['apellido'] || '',
          email: data['email'] || '',
          foto: data['foto'] || 'assets/icon/avatar-h-1.png', 
          peso: data['peso'] || 0,
          altura: data['altura'] || 0,
          objetivo: data['objetivo'] || 'No definido',
          experiencia: data['experiencia'] || 'Principiante',
          fechaRegistro: data['fechaRegistro']?.toDate() || new Date(),
          // 👇 2. Leemos el estado del puntito para saber si tenemos que limpiarlo
          vistoPorCoach: data['vistoPorCoach'] !== undefined ? data['vistoPorCoach'] : true 
        };
      });

      this.alumnosFiltrados = [...this.todosLosAlumnos];

      // 👇 3. ¡Ejecutamos la limpieza! Si hay nuevos, los marcamos como vistos.
      await this.marcarAlumnosComoVistos();

    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      this.cargando = false;
    }
  }

  // ==========================================
  // 🧹 FUNCIÓN DE LIMPIEZA DE NOTIFICACIONES
  // ==========================================
  async marcarAlumnosComoVistos() {
    if (!this.coachId || this.todosLosAlumnos.length === 0) return;

    // Abrimos un "paquete" de actualizaciones (Batch)
    const batch = writeBatch(this.firestore);
    let requiereActualizacion = false;

    // Revisamos uno por uno a tus alumnos
    this.todosLosAlumnos.forEach(alumno => {
      // Si encontramos a alguien con el foquito encendido (false)
      if (alumno.vistoPorCoach === false) {
        const alumnoRef = doc(this.firestore, 'usuarios', alumno.uid);
        batch.update(alumnoRef, { vistoPorCoach: true }); // Lo apagamos
        requiereActualizacion = true;
      }
    });

    // Si encontramos al menos a uno, mandamos el paquete a Firebase
    if (requiereActualizacion) {
      try {
        await batch.commit();
        console.log('Se apagaron los foquitos de nuevos alumnos.');
      } catch (error) {
        console.error('Error al limpiar las notificaciones:', error);
      }
    }
  }

  buscarAlumno(event: any) {
    const texto = event.target.value.toLowerCase();
    this.alumnosFiltrados = this.todosLosAlumnos.filter(a => 
      a.nombre.toLowerCase().includes(texto) || 
      a.apellido.toLowerCase().includes(texto)
    );
  }

  abrirExpediente(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.mostrarExpediente = true;
  }

  cerrarExpediente() {
    this.mostrarExpediente = false;
    setTimeout(() => this.alumnoSeleccionado = null, 300);
  }

  regresar() {
    this.navCtrl.back();
  }

  // ==========================================
  // 🚀 ACCIONES RÁPIDAS (Navegación inteligente)
  // ==========================================
  
  irACrearRutina() {
    const alumnoId = this.alumnoSeleccionado?.uid;
    this.cerrarExpediente();
    this.router.navigate(['/coach/crear-rutina'], { 
      queryParams: { preselectAlumno: alumnoId } 
    });
  }

  irACrearDieta() {
    const alumnoId = this.alumnoSeleccionado?.uid;
    this.cerrarExpediente();
    this.router.navigate(['/coach/crear-dieta'], { 
      queryParams: { preselectAlumno: alumnoId } 
    });
  }

  // Utilidades médicas
  get bmi() {
    if (!this.alumnoSeleccionado || !this.alumnoSeleccionado.peso || !this.alumnoSeleccionado.altura) return 0;
    return parseFloat((this.alumnoSeleccionado.peso / (this.alumnoSeleccionado.altura * this.alumnoSeleccionado.altura)).toFixed(1));
  }

  get imcEstado() {
    const imc = this.bmi;
    if (imc === 0) return 'N/A';
    if (imc < 18.5) return 'Bajo Peso';
    if (imc < 24.9) return 'Saludable';
    if (imc < 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }
}