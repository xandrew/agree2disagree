import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClaimBrief } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { NewClaimConfirmationComponent } from '../new-claim-confirmation/new-claim-confirmation.component';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-claim-search',
  templateUrl: './claim-search.component.html',
  styleUrls: ['./claim-search.component.scss']
})
export class ClaimSearchComponent implements OnInit {
  @Output() claimSelected = new EventEmitter<ClaimBrief>();

  constructor(
    private api: ClaimApiService,
    private dialog: MatDialog,
    public usersService: UsersService) { }

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
    const claimText = this.userInput;
    const dialogRef = this.dialog.open(NewClaimConfirmationComponent, {
      restoreFocus: false,
      autoFocus: false,
      data: { claimText }
    });
    dialogRef.afterClosed().subscribe(r => {
      if (r) {
        this.saving = true;
        this.api.newClaim(claimText).subscribe(resp => {
          this.claimSelected.emit({ id: resp, text: claimText });
        });
      }
    });
  }
}
