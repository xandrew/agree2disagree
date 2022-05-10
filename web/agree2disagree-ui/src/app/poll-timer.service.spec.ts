import { TestBed } from '@angular/core/testing';

import { PollTimerService } from './poll-timer.service';

describe('PollTimerService', () => {
  let service: PollTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PollTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
