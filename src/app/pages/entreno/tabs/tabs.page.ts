import { Component, EnvironmentInjector, inject } from '@angular/core';

// 👇 CAMBIO 1: Importamos explícitamente desde 'standalone' (ADIÓS IonicModule)
import { IonTabs, IonTabBar, IonTabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { 
  homeOutline, 
  barbellOutline, 
  personOutline, 
  restaurantOutline, 
  statsChartOutline 
} from 'ionicons/icons'; 

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  // 👇 CAMBIO 2: Registramos los componentes del menú aquí
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  // 👇 CAMBIO 3: Creamos las variables para vincularlas al HTML
  iconHome = homeOutline;
  iconBarbell = barbellOutline;
  iconPerson = personOutline;
  iconRestaurant = restaurantOutline;
  iconStats = statsChartOutline;

  constructor() {
    addIcons({ 
      homeOutline, 
      barbellOutline, 
      personOutline, 
      restaurantOutline, 
      statsChartOutline 
    });
  }
}