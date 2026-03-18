import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';

// 👇 Importamos estrictamente las versiones delgadas (outline)
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
  imports: [IonicModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    // Registramos los íconos minimalistas
    addIcons({ 
      homeOutline, 
      barbellOutline, 
      personOutline, 
      restaurantOutline, 
      statsChartOutline 
    });
  }
}