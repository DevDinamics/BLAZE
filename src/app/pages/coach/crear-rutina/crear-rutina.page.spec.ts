import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearRutinaPage } from './crear-rutina.page';

describe('CrearRutinaPage', () => {
  let component: CrearRutinaPage;
  let fixture: ComponentFixture<CrearRutinaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearRutinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
