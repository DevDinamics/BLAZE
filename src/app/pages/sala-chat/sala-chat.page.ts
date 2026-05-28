import { Component, OnInit, OnDestroy, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonIcon, IonFooter, 
  NavController, IonTitle, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, send, addOutline, callOutline, videocamOutline } from 'ionicons/icons';

import { AuthService } from 'src/app/services/auth';
import { ChatService } from 'src/app/services/chat'; 
import { Subscription } from 'rxjs';

interface Mensaje {
  id: string;
  texto: string;
  emisorId: string;
  fecha: any; 
}

@Component({
  selector: 'app-sala-chat',
  templateUrl: './sala-chat.page.html',
  styleUrls: ['./sala-chat.page.scss'],
  standalone: true,
  imports: [IonTitle, IonContent, IonHeader, IonToolbar, IonIcon, IonFooter, IonSpinner, CommonModule, FormsModule]
})
export class SalaChatPage implements OnInit, OnDestroy {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  private router = inject(Router);
  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef); // 🔥 EL MOTOR DEL TIEMPO REAL INMEDIATO

  contacto: any = null;
  miUid: string = '';
  chatId: string = '';
  
  nuevoMensaje: string = '';
  mensajes: Mensaje[] = [];
  
  // Variables para la animación estilo WhatsApp
  otroEscribiendo = false;
  typingTimeout: any;

  private unsubMensajes: any; 
  private unsubChat: any;
  private authSub: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    addIcons({ arrowBack, send, addOutline, callOutline, videocamOutline });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['contacto']) {
      this.contacto = nav.extras.state['contacto'];
    }
  }

  async ngOnInit() {
    this.authSub = this.authService.user$.subscribe(async user => {
      if (user && this.contacto) {
        this.miUid = user.uid;
        
        // Buscamos el ID sin importar si viene como 'uid' o 'id'
        const contactoId = this.contacto.uid || this.contacto.id;

        // Validamos que exista antes de llamar a Firebase
        if (!contactoId) {
          console.error('Error: No se encontró el identificador del contacto.', this.contacto);
          return;
        }

        try {
          // Obtenemos el ID de la sala y empezamos a escuchar
          this.chatId = await this.chatService.obtenerIdChat(this.miUid, contactoId);
          
          if (this.chatId) {
            
            // 1. Escuchar los mensajes instantáneos
            this.unsubMensajes = this.chatService.escucharMensajes(this.chatId, (mensajes) => {
              this.mensajes = mensajes;
              this.cdr.detectChanges(); // 🔥 OBLIGA A ANGULAR A MOSTRAR EL MENSAJE YA
              this.hacerScrollAlFondo();
            });

            // 2. Escuchar si el otro usuario está escribiendo
            this.unsubChat = this.chatService.escucharEstadoChat(this.chatId, (data) => {
              this.otroEscribiendo = data[`escribiendo_${contactoId}`] || false;
              this.cdr.detectChanges(); // Actualizamos la pantalla para mostrar la burbuja
              if (this.otroEscribiendo) this.hacerScrollAlFondo();
            });

          }
        } catch (error) {
          console.error('Error al inicializar el chat:', error);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubMensajes) this.unsubMensajes(); 
    if (this.unsubChat) this.unsubChat(); 
    if (this.authSub) this.authSub.unsubscribe();
  }

  regresar() {
    this.navCtrl.back();
  }

  // 👇 Se ejecuta cada vez que presionas una tecla en el input
  alEscribir() {
    if (!this.chatId) return;

    // Avisamos a Firebase que estamos escribiendo
    this.chatService.actualizarEscribiendo(this.chatId, this.miUid, true);

    // Si pasamos 2 segundos sin teclear, avisamos que ya dejamos de escribir
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.chatService.actualizarEscribiendo(this.chatId, this.miUid, false);
    }, 2000);
  }

  async enviarMensaje() {
    // Evitamos enviar si el input está vacío o si Firebase aún no nos da el chatId
    if (!this.nuevoMensaje.trim() || !this.chatId) return;

    const texto = this.nuevoMensaje.trim();
    this.nuevoMensaje = ''; 

    // Al enviar, apagamos el "escribiendo..." de inmediato
    clearTimeout(this.typingTimeout);
    this.chatService.actualizarEscribiendo(this.chatId, this.miUid, false);

    try {
      await this.chatService.enviarMensaje(this.chatId, texto, this.miUid);
      this.hacerScrollAlFondo();
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  }

  hacerScrollAlFondo() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }
}