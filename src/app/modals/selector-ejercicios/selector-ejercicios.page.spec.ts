import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorEjerciciosPage } from './selector-ejercicios.page';

describe('SelectorEjerciciosPage', () => {
  let component: SelectorEjerciciosPage;
  let fixture: ComponentFixture<SelectorEjerciciosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorEjerciciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
