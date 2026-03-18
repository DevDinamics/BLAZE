import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearDietaPage } from './crear-dieta.page';

describe('CrearDietaPage', () => {
  let component: CrearDietaPage;
  let fixture: ComponentFixture<CrearDietaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearDietaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
