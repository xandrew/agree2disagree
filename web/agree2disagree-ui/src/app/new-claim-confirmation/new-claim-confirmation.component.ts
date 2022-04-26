import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-claim-confirmation',
  templateUrl: './new-claim-confirmation.component.html',
  styleUrls: ['./new-claim-confirmation.component.scss']
})
export class NewClaimConfirmationComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { claimText: string }) { }

  ngOnInit(): void {
  }

}
