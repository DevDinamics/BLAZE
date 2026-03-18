import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnirseEquipoPage } from './unirse-equipo.page';

describe('UnirseEquipoPage', () => {
  let component: UnirseEquipoPage;
  let fixture: ComponentFixture<UnirseEquipoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UnirseEquipoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
