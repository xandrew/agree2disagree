import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ArgumentMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-new-argument',
  templateUrl: './new-argument.component.html',
  styleUrls: ['./new-argument.component.scss']
})
export class NewArgumentComponent implements OnInit {
  @Input() claimId = '';
  @Input() argumentMeta!: ArgumentMeta;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<string>();

  saving = false;

  constructor(
    private api: ClaimApiService,
    private usersService: UsersService) { }

  get currentUser() {
    return this.usersService.currentUser;
  }

  ngOnInit(): void {
  }

  save() {
    this.saving = true;
    if (this.argumentMeta.id === '#NEW') {
      this.api.newArgument(
        this.claimId,
        this.argumentMeta.text.text,
        this.argumentMeta.isAgainst,
        this.argumentMeta.forkHistory).subscribe(resp => {
          this.onSaved.emit(resp);
        });
    } else {
      this.api.replaceArgument(
        this.claimId,
        this.argumentMeta.id,
        this.argumentMeta.text.text).subscribe(resp => {
          this.onSaved.emit(resp);
        });
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
