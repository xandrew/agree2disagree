import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';

@Component({
  selector: 'app-new-counter',
  templateUrl: './new-counter.component.html',
  styleUrls: ['./new-counter.component.scss']
})
export class NewCounterComponent implements OnInit {
  @Input() claimId = '';
  @Input() argumentId = '';
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<string>();

  text = "";

  constructor(private api: ClaimApiService) { }

  ngOnInit(): void {
  }

  save() {
    this.api.newCounter(this.claimId, this.argumentId, this.text).subscribe(
      resp => {
        this.onSaved.emit(resp);
      });;
  }

  cancel() {
    this.onCancel.emit();
  }
}
