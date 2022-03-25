import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ClaimBrief } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';

@Component({
  selector: 'app-claim-search',
  templateUrl: './claim-search.component.html',
  styleUrls: ['./claim-search.component.scss']
})
export class ClaimSearchComponent implements OnInit {
  @Output() claimSelected = new EventEmitter<ClaimBrief>();

  constructor(private api: ClaimApiService) { }

  claims: ClaimBrief[] = [];
  private _userInput = "";
  get userInput() { return this._userInput; }
  set userInput(userInput: string) {
    this._userInput = userInput;
    this.refilter();
  }
  filteredClaims: ClaimBrief[] = [];

  ngOnInit(): void {
    this.api.loadAllClaims().subscribe(claims => {
      this.claims = claims;
      this.refilter();
    });
  }

  refilter() {
    const words = this.userInput.split(' ');
    this.filteredClaims = this.claims.filter(claim => {
      const text = claim.text;
      for (let word of words) {
        if (text.indexOf(word) === -1) return false;
      }
      return true;
    }).splice(0, 20);
  }

  saving = false;
  saveAsNewClaim() {
    this.saving = true;
    const claimText = this.userInput;
    this.api.newClaim(claimText).subscribe(resp => {
      this.claimSelected.emit({ id: resp, text: claimText });
    });;
  }
}
