import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ClaimApiModule {
  constructor(private http: HttpClient) {}

  new_claim(text: string) {
    interface NewClaimResponse {
      claim_id: string;
    }
    return this.http.post<NewClaimResponse>('/new_claim', {'text': text})
  }
}
