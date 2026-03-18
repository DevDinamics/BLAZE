import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlumnoDetallePage } from './alumno-detalle.page';

describe('AlumnoDetallePage', () => {
  let component: AlumnoDetallePage;
  let fixture: ComponentFixture<AlumnoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlumnoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
