import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaChatPage } from './sala-chat.page';

describe('SalaChatPage', () => {
  let component: SalaChatPage;
  let fixture: ComponentFixture<SalaChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
