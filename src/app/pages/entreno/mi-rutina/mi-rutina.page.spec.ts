import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiRutinaPage } from './mi-rutina.page';

describe('MiRutinaPage', () => {
  let component: MiRutinaPage;
  let fixture: ComponentFixture<MiRutinaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MiRutinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
