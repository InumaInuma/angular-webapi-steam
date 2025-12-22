import { TestBed } from '@angular/core/testing';

import { Walletservice } from './walletservice';

describe('Walletservice', () => {
  let service: Walletservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Walletservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
