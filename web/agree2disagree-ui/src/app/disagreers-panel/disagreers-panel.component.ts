import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-disagreers-panel',
  templateUrl: './disagreers-panel.component.html',
  styleUrls: ['./disagreers-panel.component.scss']
})
export class DisagreersPanelComponent implements OnInit {
  adding = false;
  email = '';

  constructor(public usersService: UsersService) { }

  ngOnInit(): void {
  }

  addDisagreer() {
    this.usersService.addDisagreer(this.email).subscribe();
    this.adding = false;
  }
}
