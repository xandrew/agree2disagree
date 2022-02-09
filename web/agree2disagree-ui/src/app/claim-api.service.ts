import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ArgumentMeta, ClaimMeta } from './ajax-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClaimApiService {

  constructor(private http: HttpClient) { }

  load_claim(claim_id: string) {
    return this.http.post<ClaimMeta>('/get_claim', { claim_id });
  }

  new_claim(text: string) {
    return this.http.post<string>('/new_claim', { 'text': text })
  }

  load_arguments(claim_id: string) {
    return this.http.post<ArgumentMeta[]>('/get_arguments', { claim_id })
  }

  new_argument(claim_id: string, text: string, isAgainst: boolean) {
    return this.http.post<string>(
      '/new_argument', { claim_id, text, isAgainst });
  }
}
