import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-new-argument',
  templateUrl: './new-argument.component.html',
  styleUrls: ['./new-argument.component.scss']
})
export class NewArgumentComponent implements OnInit {
  @Input() claimId = '';
  @Input() startAgainst = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<[string, boolean]>();

  text = "";
  isAgainst = false;
  saving = false;

  constructor(
    private api: ClaimApiService,
    private usersService: UsersService) { }

  get currentUser() {
    return this.usersService.currentUser;
  }

  ngOnInit(): void {
    this.isAgainst = this.startAgainst;
  }

  save() {
    this.saving = true;
    this.api.newArgument(this.claimId, this.text, this.isAgainst).subscribe(resp => {
      this.onSaved.emit([resp, this.isAgainst]);
    });;
  }

  cancel() {
    this.onCancel.emit();
  }
}
