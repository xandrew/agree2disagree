import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AnoTextMeta, ArgumentMeta, ClaimBrief, ClaimMeta, CounterDict, CounterMeta, Opinion } from './ajax-interfaces';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';

interface OpinionCacheItem {
  subject: Subject<Opinion>;
  subscription?: Subscription;
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

  newArgument(claimId: string, text: string, isAgainst: boolean) {
    return this.http.post<string>(
      '/new_argument', { claimId, text, isAgainst });
  }

  loadCounters(claimId: string, argumentId: string) {
    return this.http.post<CounterMeta[]>(
      '/get_counters', { claimId, argumentId })
  }

  newCounter(claimId: string, argumentId: string, text: string) {
    return this.http.post<string>(
      '/new_counter', { claimId, argumentId, text });
  }

  loadText(textId: string) {
    return this.http.post<AnoTextMeta>('/get_ano_text', { textId });
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

  setOpinion(
    claimId: string,
    value: number | undefined,
    selectedArgumentsFor: string[],
    selectedArgumentsAgainst: string[],
    selectedCounters: CounterDict) {

    const key = this.opinionCacheKey(claimId, undefined);
    let cacheItem = this.opinionCache[key];
    if (cacheItem !== undefined) {
      if (cacheItem.subscription) {
        cacheItem.subscription.unsubscribe();
      }
      cacheItem.subscription = undefined;
    } else {
      cacheItem = { subject: new ReplaySubject<Opinion>(1) };
      this.opinionCache[key] = cacheItem;
    }
    const opinion = {
      value,
      selectedArgumentsFor,
      selectedArgumentsAgainst,
      selectedCounters
    };
    cacheItem.subject.next(opinion);
    return this.http.post<{}>(
      '/set_opinion',
      {
        claimId,
        value,
        selectedArgumentsFor,
        selectedArgumentsAgainst,
        selectedCounters
      });
  }

  getOpinion(claimId: string, userId?: string): Observable<Opinion> {
    const key = this.opinionCacheKey(claimId, userId);
    if (!this.opinionCache.hasOwnProperty(key)) {
      const subject = new ReplaySubject<Opinion>(1);
      // We do not just subscibe the subject because we don't want it to
      // complete with the success of the http request. Ideally we should
      // handle errors and stuff here, though.
      const subscription = this.http.post<Opinion>(
        '/get_opinion', { claimId, userId }).subscribe(
          opinion => subject.next(opinion));
      this.opinionCache[key] = { subject, subscription };
    }
    return this.opinionCache[key].subject;
  }
}
