import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-disagreer-invite',
  templateUrl: './disagreer-invite.component.html',
  styleUrls: ['./disagreer-invite.component.scss']
})
export class DisagreerInviteComponent implements OnInit {

  constructor(
    private router: Router,
    private usersService: UsersService) { }

  get shareUrl() {
    return `${window.location.href}?disagreer=${this.usersService.currentUser?.email}`;
  }

  ngOnInit(): void {
  }

}
