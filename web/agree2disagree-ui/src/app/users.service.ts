import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { UserMeta } from './user-meta';
import { BehaviorSubject, map, Subscription, filter } from 'rxjs';
import { Router } from '@angular/router';

interface UserResponse {
  email: string;
  givenName: string;
  picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  currentUser: UserMeta | undefined = undefined;

  disagreer: UserMeta | undefined = undefined;
  disagreer$ = new BehaviorSubject<UserMeta | undefined>(undefined);

  loggedIn$ = new BehaviorSubject<boolean | undefined>(undefined);

  nextURLAfterLogin?: string;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router) {
    this.http.get<UserResponse>('/login_state').subscribe(resp => {
      if (resp.email) {
        this.currentUser = this.responseToMeta(resp);
        this.loggedIn$.next(true);
      } else {
        this.currentUser = undefined;
        this.loggedIn$.next(false);
      }
    });
  }

  private responseToMeta(response: UserResponse) {
    return {
      email: response.email,
      givenName: response.givenName,
      picture: this.sanitizer.bypassSecurityTrustUrl(response.picture)
    };
  }

  private getUserResponse(email: string) {
    return this.http.post<UserResponse>('/get_user', { email });
  }

  getUser(email: string) {
    return this.getUserResponse(email).pipe(
      map(resp => {
        if (resp.email) {
          return this.responseToMeta(resp);
        } else {
          return undefined;
        }
      }));
  }

  addDisagreer(email: string) {
    return this.getUserResponse(email).pipe(
      map(resp => {
        if (resp.email) {
          this.disagreer = this.responseToMeta(resp);
          this.disagreer$.next(this.disagreer);
          return true;
        }
        return false;
      }));
  }

  getFavoriteDisagreers() {
    return this.http.post<UserResponse[]>('/get_favorite_disagreers', {}).pipe(
      map(resp => {
        return resp.map(response => this.responseToMeta(response));
      }));
  }

  needsLogin$ = this.loggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn === false) {
        this.nextURLAfterLogin = window.location.href;
        this.router.navigate(['login']);
      }
      return isLoggedIn;
    }),
    filter(isLoggedIn => { return isLoggedIn ?? false; }));

}
