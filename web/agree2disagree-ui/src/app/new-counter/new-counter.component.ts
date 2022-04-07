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
  @Input() startingText = '';
  @Input() replaceId = '';

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<string>();

  text = "";
  saving = false;

  constructor(private api: ClaimApiService) { }

  ngOnInit(): void {
    this.text = this.startingText;
  }

  save() {
    this.saving = true;
    if (this.replaceId !== '') {
      this.api.replaceCounter(
        this.claimId,
        this.argumentId,
        this.replaceId,
        this.text).subscribe(resp => {
          this.onSaved.emit(resp);
        });
    } else {
      this.api.newCounter(this.claimId, this.argumentId, this.text).subscribe(
        resp => {
          this.onSaved.emit(resp);
        });
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
