import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimBrief } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';

@Component({
  selector: 'app-claim-selector',
  templateUrl: './claim-selector.component.html',
  styleUrls: ['./claim-selector.component.scss']
})
export class ClaimSelectorComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { textFragment: string },
    private api: ClaimApiService) { }

  claims: ClaimBrief[] = [];
  negated = false;

  selectedClaimIdx: number | undefined = undefined;

  ngOnInit(): void {
    this.api.loadAllClaims().subscribe(claims => { this.claims = claims; });
  }

  selectClaim(idx: number) {
    this.selectedClaimIdx = idx;
  }
}
