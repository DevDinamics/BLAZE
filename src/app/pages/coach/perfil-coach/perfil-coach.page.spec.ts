import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilCoachPage } from './perfil-coach.page';

describe('PerfilCoachPage', () => {
  let component: PerfilCoachPage;
  let fixture: ComponentFixture<PerfilCoachPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilCoachPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
