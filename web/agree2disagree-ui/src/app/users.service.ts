import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { UserMeta } from './user-meta';
import { BehaviorSubject, map } from 'rxjs';

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

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
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
  addDisagreer(email: string) {
    return this.http.post<UserResponse>('/get_user', { email }).pipe(
      map(resp => {
        if (resp.email) {
          this.disagreer = this.responseToMeta(resp);
          this.disagreer$.next(this.disagreer);
          return true;
        }
        return false;
      }));
  }
}
