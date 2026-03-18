import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntrenoDashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let component: EntrenoDashboardPage;
  let fixture: ComponentFixture<EntrenoDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrenoDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
