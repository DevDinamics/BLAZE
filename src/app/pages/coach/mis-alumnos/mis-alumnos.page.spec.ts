import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisAlumnosPage } from './mis-alumnos.page';

describe('MisAlumnosPage', () => {
  let component: MisAlumnosPage;
  let fixture: ComponentFixture<MisAlumnosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisAlumnosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
