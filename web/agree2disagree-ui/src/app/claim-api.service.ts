import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaimApiService {

  constructor(private http: HttpClient) { }

  new_claim(text: string) {
    interface NewClaimResponse {
      claim_id: string;
    }
    return this.http.post<NewClaimResponse>('/new_claim', { 'text': text })
  }
}
