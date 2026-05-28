import { Component, EnvironmentInjector, inject } from '@angular/core';

import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { 
  home, homeOutline, 
  barbell, barbellOutline, 
  chatbubbles, chatbubblesOutline, // 👈 Íconos de Chat
  restaurant, restaurantOutline, 
  statsChart, statsChartOutline 
} from 'ionicons/icons'; 

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ 
      home, homeOutline, 
      barbell, barbellOutline, 
      chatbubbles, 'chatbubbles-outline': chatbubblesOutline, // 👈 Registramos el chat
      restaurant, restaurantOutline, 
      'stats-chart': statsChart,
      'stats-chart-outline': statsChartOutline 
    });
  }
}