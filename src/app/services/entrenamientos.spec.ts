import { TestBed } from '@angular/core/testing';

import { Entrenamientos } from './entrenamientos';

describe('Entrenamientos', () => {
  let service: Entrenamientos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Entrenamientos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
