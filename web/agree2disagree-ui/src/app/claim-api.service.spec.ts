import { TestBed } from '@angular/core/testing';

import { ClaimApiService } from './claim-api.service';

describe('ClaimApiService', () => {
  let service: ClaimApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
