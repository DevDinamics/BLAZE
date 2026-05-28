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
import { ChatService } from 'src/app/services/chat'; // Asegúrate de que termine en .service si es necesario
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
  private cdr = inject(ChangeDetectorRef); 

  contacto: any = null;
  miUid: string = '';
  chatId: string = '';
  
  nuevoMensaje: string = '';
  mensajes: Mensaje[] = [];
  
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
        
        const contactoId = this.contacto.uid || this.contacto.id;

        if (!contactoId) {
          console.error('Error: No se encontró el identificador del contacto.', this.contacto);
          return;
        }

        try {
          this.chatId = await this.chatService.obtenerIdChat(this.miUid, contactoId);
          
          if (this.chatId) {
            
            // 👇 1. LIMPIAR NOTIFICACIONES AL ENTRAR A LA SALA
            this.chatService.limpiarNotificaciones(this.chatId, this.miUid);

            this.unsubMensajes = this.chatService.escucharMensajes(this.chatId, (mensajes) => {
              this.mensajes = mensajes;
              this.cdr.detectChanges(); 
              this.hacerScrollAlFondo();

              // 👇 2. SI LLEGA UN MENSAJE Y ESTÁS ADENTRO, SE MARCA COMO LEÍDO AL INSTANTE
              this.chatService.limpiarNotificaciones(this.chatId, this.miUid);
            });

            this.unsubChat = this.chatService.escucharEstadoChat(this.chatId, (data) => {
              this.otroEscribiendo = data[`escribiendo_${contactoId}`] || false;
              this.cdr.detectChanges(); 
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

  alEscribir() {
    if (!this.chatId) return;

    this.chatService.actualizarEscribiendo(this.chatId, this.miUid, true);

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.chatService.actualizarEscribiendo(this.chatId, this.miUid, false);
    }, 2000);
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.chatId) return;

    const texto = this.nuevoMensaje.trim();
    this.nuevoMensaje = ''; 

    clearTimeout(this.typingTimeout);
    this.chatService.actualizarEscribiendo(this.chatId, this.miUid, false);

    try {
      // 👇 3. ENVIAR EL MENSAJE CON EL ID DEL OTRO USUARIO PARA QUE LE SUENE LA NOTIFICACIÓN
      const contactoId = this.contacto.uid || this.contacto.id;
      await this.chatService.enviarMensaje(this.chatId, texto, this.miUid, contactoId);
      
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