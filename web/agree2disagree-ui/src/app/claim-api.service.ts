import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ArgumentMeta, ClaimBrief, ClaimBriefWithOpinion, ClaimMeta, CounterDict, CounterMeta, Opinion } from './ajax-interfaces';
import { exhaustMap, merge, Observable, ReplaySubject, shareReplay, Subject, take, tap, timer } from 'rxjs';

interface OpinionCacheItem {
  overrideSubject: Subject<Opinion>;
  opinionPoll$: Observable<Opinion>;
  lastKnownOpinion$: Observable<Opinion>;
}


@Injectable({
  providedIn: 'root'
})
export class ClaimApiService {

  constructor(private http: HttpClient) { }

  loadClaim(claimId: string) {
    return this.http.post<ClaimMeta>('/get_claim', { claimId });
  }

  newClaim(text: string) {
    return this.http.post<string>('/new_claim', { 'text': text })
  }

  loadArguments(claimId: string) {
    return this.http.post<ArgumentMeta[]>('/get_arguments', { claimId })
  }

  newArgument(
    claimId: string,
    text: string,
    isAgainst: boolean,
    forkHistory: string[]) {
    return this.http.post<string>(
      '/new_argument', { claimId, text, isAgainst, forkHistory });
  }

  replaceArgument(claimId: string, argumentId: string, text: string) {
    return this.http.post<string>(
      '/replace_argument', { claimId, argumentId, text });
  }

  deleteArgument(claimId: string, argumentId: string) {
    return this.http.post<string>(
      '/delete_argument', { claimId, argumentId });
  }

  loadCounters(claimId: string, argumentId: string) {
    return this.http.post<CounterMeta[]>(
      '/get_counters', { claimId, argumentId })
  }

  newCounter(claimId: string, argumentId: string, text: string) {
    return this.http.post<string>(
      '/new_counter', { claimId, argumentId, text });
  }

  replaceCounter(claimId: string, argumentId: string, counterId: string, text: string) {
    return this.http.post<string>(
      '/replace_counter', { claimId, argumentId, counterId, text });
  }

  deleteCounter(claimId: string, argumentId: string, counterId: string) {
    return this.http.post<string>(
      '/delete_counter', { claimId, argumentId, counterId });
  }

  loadAllClaims() {
    return this.http.post<ClaimBrief[]>('/get_all_claims', {});
  }

  newAnnotation(
    textId: string,
    claimId: string,
    negated: boolean,
    startInText: number,
    endInText: number) {
    return this.http.post<string>(
      '/new_annotation',
      { textId, claimId, negated, startInText, endInText });
  }


  opinionCache: {
    [key: string]: OpinionCacheItem;
  } = {};

  opinionCacheKey(claimId: string, userId?: string) {
    return `${claimId}::${userId ?? 'CURRENT'}`;
  }

  newCacheItem(claimId: string, userId?: string): OpinionCacheItem {
    const overrideSubject = new Subject<Opinion>();
    const lastKnownOpinion$ = new ReplaySubject<Opinion>(1);
    const poller = timer(0, 2000).pipe(
      exhaustMap(_ => {
        return this.http.post<Opinion>(
          '/get_opinion', { claimId, userId })
      }),
    );
    const opinionPoll$ = merge(overrideSubject, poller).pipe(
      tap(opinion => lastKnownOpinion$.next(opinion)),
      shareReplay({ bufferSize: 1, refCount: true }))

    // Making sure at least one item shows up in lastKnownOpinion$.
    opinionPoll$.pipe(take(1)).subscribe();

    return {
      overrideSubject,
      opinionPoll$,
      lastKnownOpinion$,
    };
  }

  cacheItem(claimId: string, userId?: string): OpinionCacheItem {
    const key = this.opinionCacheKey(claimId, userId);
    if (this.opinionCache[key] === undefined) {
      this.opinionCache[key] = this.newCacheItem(claimId, userId);
    }
    return this.opinionCache[key];
  }

  setOpinion(
    claimId: string,
    value: number | undefined,
    selectedArgumentsFor: string[],
    selectedArgumentsAgainst: string[],
    selectedCounters: CounterDict) {

    const cacheItem = this.cacheItem(claimId, undefined);
    const opinion = {
      value,
      selectedArgumentsFor,
      selectedArgumentsAgainst,
      selectedCounters
    };
    return this.http.post<{}>(
      '/set_opinion',
      {
        claimId,
        value,
        selectedArgumentsFor,
        selectedArgumentsAgainst,
        selectedCounters
      }).pipe(
        tap(_ => {
          cacheItem.overrideSubject.next(opinion);
        })
      );
  }

  pollOpinion(claimId: string, userId?: string): Observable<Opinion> {
    const cacheItem = this.cacheItem(claimId, userId);
    return cacheItem.opinionPoll$;
  }

  getLastKnownOpinion(claimId: string, userId?: string): Observable<Opinion> {
    const cacheItem = this.cacheItem(claimId, userId);
    return cacheItem.lastKnownOpinion$;
  }

  getClaimsForUser(userId: string): Observable<ClaimBriefWithOpinion[]> {
    return this.http.post<ClaimBrief[]>('/get_claims_for_user', { userId });
  }
}
