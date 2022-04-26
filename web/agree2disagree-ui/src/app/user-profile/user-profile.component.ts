import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Observable } from 'rxjs';

import { map, switchMap } from 'rxjs/operators';
import { ClaimBrief } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { UserMeta } from '../user-meta';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private api: ClaimApiService,
    private usersService: UsersService) { }

  user$?: Observable<UserMeta | undefined>;
  claims$?: Observable<ClaimBrief[]>;

  ngOnInit(): void {
    const email$ = this.route.paramMap.pipe(
      map(params => params.get('email') || ''));
    this.claims$ = email$.pipe(
      switchMap(email => {
        if (email !== '') {
          return this.api.getClaimsForUser(email);
        } else {
          return of([]);
        }
      })
    );
    this.user$ = email$.pipe(
      switchMap(email => {
        if (email !== '') {
          return this.usersService.getUser(email);
        } else {
          return of(undefined);
        }
      }));
  }
}
