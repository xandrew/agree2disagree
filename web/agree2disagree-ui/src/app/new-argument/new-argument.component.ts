import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';

@Component({
  selector: 'app-new-argument',
  templateUrl: './new-argument.component.html',
  styleUrls: ['./new-argument.component.scss']
})
export class NewArgumentComponent implements OnInit {
  @Input() claimId = '';
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<string>();

  text = "";
  isAgainst = false;

  constructor(private api: ClaimApiService) { }

  ngOnInit(): void {

  }

  save() {
    console.log('Saving: ' + this.text);
    this.api.new_argument(this.claimId, this.text, this.isAgainst).subscribe(resp => {
      this.onSaved.emit(resp);
    });;
  }

  cancel() {
    this.onCancel.emit();
  }
}
