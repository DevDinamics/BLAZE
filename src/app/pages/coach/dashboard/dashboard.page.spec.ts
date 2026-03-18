import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoachDashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let component: CoachDashboardPage;
  let fixture: ComponentFixture<CoachDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
