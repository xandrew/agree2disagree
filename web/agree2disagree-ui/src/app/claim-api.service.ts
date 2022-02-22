import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AnoTextMeta, ArgumentMeta, ClaimMeta, CounterMeta } from './ajax-interfaces';

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
}
