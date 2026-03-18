import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DietasPage } from './dietas.page';

describe('DietasPage', () => {
  let component: DietasPage;
  let fixture: ComponentFixture<DietasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DietasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
