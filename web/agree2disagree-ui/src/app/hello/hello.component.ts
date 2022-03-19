import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent implements OnInit {
  expanded = true;

  constructor(public users: UsersService, private router: Router) { }

  ngOnInit(): void {
  }

  claimSelected(claimId: string) {
    this.router.navigate(['claim', claimId]);
  }

}
