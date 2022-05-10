import { Injectable } from '@angular/core';
import { fromEvent, map, merge, Observable, share, switchMap, take, throttleTime, timer, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollTimerService {
  readonly pollHeartBeat$: Observable<number>;

  constructor() {
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const listenerObss = activityEvents.map(
      eventName => fromEvent(window, eventName))
    const activity$ = merge(...listenerObss).pipe(
      map(_ => 0),
      startWith(0),
      throttleTime(10000));

    // We share and subscribe to keep it running.
    const heartBeat$ = timer(0, 2000).pipe(share());
    heartBeat$.subscribe();

    this.pollHeartBeat$ = activity$.pipe(
      switchMap(_ => heartBeat$.pipe(take(120))),
      share(),  // We want to subscribe to events only once.
    );
  }
}
