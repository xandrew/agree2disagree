import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent implements OnInit {

  constructor(
      private http: HttpClient,
      private route: ActivatedRoute) { }

  claim_id = '';
  text = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.claim_id = params.get('id') || '';
        return this.http.post<string>(
            '/get_claim_text', {'claim_id': this.claim_id});
      })).subscribe(resp => {
        this.text = resp;
      })
  }

}
