import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ClaimApiModule } from '../claim-api/claim-api.module';

@Component({
  selector: 'app-new-claim',
  templateUrl: './new-claim.component.html',
  styleUrls: ['./new-claim.component.scss']
})
export class NewClaimComponent implements OnInit {
  text = "";

  constructor(
      private claimApi: ClaimApiModule,
      private router: Router) { }

  ngOnInit(): void {
  }

  save() {
    console.log('Saving: ' + this.text);
    this.claimApi.new_claim(this.text).subscribe(resp => {
      this.router.navigate(['claim', resp.claim_id]);
    });;
  }
}
