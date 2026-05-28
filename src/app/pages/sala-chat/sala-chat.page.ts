import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
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

  contacto: any = null;
  miUid: string = '';
  chatId: string = '';
  
  nuevoMensaje: string = '';
  mensajes: Mensaje[] = [];
  
  private unsub: any; 
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
        
        // 👇 SOLUCIÓN: Buscamos el ID sin importar si viene como 'uid' o 'id'
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
            this.unsub = this.chatService.escucharMensajes(this.chatId, (mensajes) => {
              this.mensajes = mensajes;
              this.hacerScrollAlFondo();
            });
          }
        } catch (error) {
          console.error('Error al inicializar el chat:', error);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub(); 
    if (this.authSub) this.authSub.unsubscribe();
  }

  regresar() {
    this.navCtrl.back();
  }

  async enviarMensaje() {
    // Evitamos enviar si el input está vacío o si Firebase aún no nos da el chatId
    if (!this.nuevoMensaje.trim() || !this.chatId) return;

    const texto = this.nuevoMensaje.trim();
    this.nuevoMensaje = ''; 

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