import { CanDeactivateFn } from '@angular/router';

// Definimos el contrato para que el Guard sepa qué buscar
export interface CanComponentDeactivate {
  ionViewCanLeave: () => boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // Si el componente tiene la función ionViewCanLeave, que decida ella. Si no, lo deja salir.
  return component.ionViewCanLeave ? component.ionViewCanLeave() : true;
};