import { TestBed } from '@angular/core/testing';

import { Dota } from '../service/dota';

describe('Dota', () => {
  let service: Dota;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dota);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
