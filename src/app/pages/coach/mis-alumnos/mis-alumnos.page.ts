import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe necesario en standalone para usar | date
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

import { 
  NavController, 
  LoadingController, 
  AlertController,
  IonContent,
  IonIcon,
  IonModal,
  IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, searchOutline, personOutline, scaleOutline, bodyOutline, 
  fitnessOutline, closeOutline, barbellOutline, restaurantOutline, starOutline,
  mailOutline, calendarOutline, flagOutline, chatbubblesOutline, trashOutline
} from 'ionicons/icons';

// ⚡ Agregamos arrayRemove a la importación
import { Firestore, collection, query, where, getDocs, writeBatch, doc, updateDoc, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-alumnos',
  templateUrl: './mis-alumnos.page.html',
  styleUrls: ['./mis-alumnos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DatePipe, // 👈 Agregado para que compile en producción
    IonContent, 
    IonIcon, 
    IonModal, 
    IonSpinner
  ]
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

  // 🛡️ Bindings directos para Producción (AOT)
  iconArrowBack = arrowBackOutline;
  iconSearch = searchOutline;
  iconPerson = personOutline;
  iconMail = mailOutline;
  iconClose = closeOutline;
  iconStar = starOutline;
  iconCalendar = calendarOutline;
  iconFlag = flagOutline;
  iconScale = scaleOutline;
  iconBody = bodyOutline;
  iconFitness = fitnessOutline;
  iconChatbubbles = chatbubblesOutline;
  iconBarbell = barbellOutline;
  iconRestaurant = restaurantOutline;
  iconTrash = trashOutline;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      arrowBackOutline, searchOutline, personOutline, scaleOutline, bodyOutline, 
      fitnessOutline, closeOutline, barbellOutline, restaurantOutline, starOutline,
      mailOutline, calendarOutline, flagOutline, chatbubblesOutline, trashOutline
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
        where('coachId', '==', this.coachId)
      );
      
      const snapshot = await getDocs(q);
      
      let todos = snapshot.docs.map(doc => {
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
          equipoId: data['equipoId'] || null, // 👈 Lo necesitamos para el borrado
          fechaRegistro: data['fechaRegistro']?.toDate() || new Date(),
          vistoPorCoach: data['vistoPorCoach'] !== undefined ? data['vistoPorCoach'] : true,
          rol: data['rol'] 
        };
      });

      this.todosLosAlumnos = todos.filter((user: any) => user.rol === 'alumno' || user.rol === 'atleta');
      this.alumnosFiltrados = [...this.todosLosAlumnos];

      await this.marcarAlumnosComoVistos();

    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async marcarAlumnosComoVistos() {
    if (!this.coachId || this.todosLosAlumnos.length === 0) return;

    const batch = writeBatch(this.firestore);
    let requiereActualizacion = false;

    this.todosLosAlumnos.forEach(alumno => {
      if (alumno.vistoPorCoach === false) {
        const alumnoRef = doc(this.firestore, 'usuarios', alumno.uid);
        batch.update(alumnoRef, { vistoPorCoach: true }); 
        requiereActualizacion = true;
      }
    });

    if (requiereActualizacion) {
      try {
        await batch.commit();
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

  iniciarChatConAlumno() {
    const alumno = this.alumnoSeleccionado;
    this.cerrarExpediente();
    this.router.navigate(['/sala-chat'], {
      state: { contacto: alumno }
    });
  }
  
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

  async confirmarEliminarAlumno() {
    const alumno = this.alumnoSeleccionado;
    if (!alumno) return;

    const alert = await this.alertCtrl.create({
      mode: 'ios',
      header: 'Remover del Team',
      message: `¿Estás seguro de desvincular a ${alumno.nombre} ${alumno.apellido} de tu equipo? Su cuenta permanecerá activa pero ya no aparecerá en tu directorio.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.eliminarAlumno(alumno);
          }
        }
      ]
    });

    await alert.present();
  }

  private async eliminarAlumno(alumno: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Desvinculando...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      // 1. Limpiamos la vinculación en el perfil del alumno
      const alumnoRef = doc(this.firestore, 'usuarios', alumno.uid);
      await updateDoc(alumnoRef, { 
        coachId: null,
        equipoId: null,
        nombreEquipo: null
      });

      // 2. ⚡ FIX: Removemos su UID del arreglo del equipo
      if (alumno.equipoId) {
        const equipoRef = doc(this.firestore, 'equipos', alumno.equipoId);
        await updateDoc(equipoRef, { 
          miembros: arrayRemove(alumno.uid) 
        });
      }

      this.todosLosAlumnos = this.todosLosAlumnos.filter(a => a.uid !== alumno.uid);
      this.alumnosFiltrados = this.alumnosFiltrados.filter(a => a.uid !== alumno.uid);

      this.cerrarExpediente();
    } catch (error) {
      console.error('Error al remover alumno:', error);
    } finally {
      await loading.dismiss();
    }
  }

  // 🚀 FIX: Lógica mejorada del cálculo de BMI
  get bmi() {
    if (!this.alumnoSeleccionado || !this.alumnoSeleccionado.peso || !this.alumnoSeleccionado.altura) return 0;
    
    let alturaMetros = this.alumnoSeleccionado.altura;
    if (alturaMetros > 3) {
      alturaMetros = alturaMetros / 100;
    }

    return parseFloat((this.alumnoSeleccionado.peso / (alturaMetros * alturaMetros)).toFixed(1));
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