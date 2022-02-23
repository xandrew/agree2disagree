import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-claim-selector',
  templateUrl: './claim-selector.component.html',
  styleUrls: ['./claim-selector.component.scss']
})
export class ClaimSelectorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { textFragment: string }) { }

  ngOnInit(): void {
  }
}
