import { Component, EnvironmentInjector, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // 1. Agrega ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, homeOutline, barbell, barbellOutline, person, personOutline, restaurant, restaurantOutline, statsChart, statsChartOutline, chatbubbles, chatbubblesOutline } from 'ionicons/icons'; 

import { AuthService } from '../../../services/auth';
import { ChatService } from '../../../services/chat';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, CommonModule],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  private cdr = inject(ChangeDetectorRef); // 2. Inyecta el detector

  mensajesSinLeer: number = 0; 
  
  private authSub: Subscription | null = null;
  private unsubNotificaciones: any;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {
    addIcons({ home, homeOutline, barbell, barbellOutline, person, personOutline, restaurant, restaurantOutline, 'stats-chart': statsChart, 'stats-chart-outline': statsChartOutline, chatbubbles, 'chatbubbles-outline': chatbubblesOutline });
  }

  ngOnInit() {
    this.authSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.unsubNotificaciones = this.chatService.escucharTotalSinLeer(user.uid, (total) => {
          this.mensajesSinLeer = total;
          this.cdr.detectChanges(); // 3. ¡Aquí está el truco! Obliga a refrescar el ícono
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.unsubNotificaciones) this.unsubNotificaciones();
  }
}