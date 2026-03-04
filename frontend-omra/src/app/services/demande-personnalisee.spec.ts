import { TestBed } from '@angular/core/testing';

import { DemandePersonnalisee } from './demande-personnalisee';

describe('DemandePersonnalisee', () => {
  let service: DemandePersonnalisee;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandePersonnalisee);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
