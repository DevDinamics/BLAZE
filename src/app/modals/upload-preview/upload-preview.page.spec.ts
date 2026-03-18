import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadPreviewPage } from './upload-preview.page';

describe('UploadPreviewPage', () => {
  let component: UploadPreviewPage;
  let fixture: ComponentFixture<UploadPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
