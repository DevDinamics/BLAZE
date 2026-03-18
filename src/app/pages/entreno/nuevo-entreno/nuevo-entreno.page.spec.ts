import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoEntrenoPage } from './nuevo-entreno.page';

describe('NuevoEntrenoPage', () => {
  let component: NuevoEntrenoPage;
  let fixture: ComponentFixture<NuevoEntrenoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoEntrenoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
