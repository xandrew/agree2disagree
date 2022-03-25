import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-disagreers-panel',
  templateUrl: './disagreers-panel.component.html',
  styleUrls: ['./disagreers-panel.component.scss']
})
export class DisagreersPanelComponent implements OnInit {
  adding = false;
  email = '';

  constructor(
    public usersService: UsersService,
    private router: Router) { }

  ngOnInit(): void {
    this.usersService.loggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn === false) {
        this.usersService.nextURLAfterLogin = window.location.href;
        this.router.navigate(['login']);
      }
    });
  }

  addDisagreer() {
    this.usersService.addDisagreer(this.email).subscribe();
    this.adding = false;
  }
}
