import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryViewerPage } from './story-viewer.page';

describe('StoryViewerPage', () => {
  let component: StoryViewerPage;
  let fixture: ComponentFixture<StoryViewerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
