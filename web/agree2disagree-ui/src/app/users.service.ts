import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { UserMeta } from './user-meta';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  currentUser: UserMeta | undefined = undefined;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    interface UserResponse {
      email: string;
      givenName: string;
      picture: string;
    }
    this.http.get<UserResponse>('/login_state').subscribe(resp => {
      if (resp.email) {
        this.currentUser = {
          email: resp.email,
          givenName: resp.givenName,
          picture: this.sanitizer.bypassSecurityTrustUrl(resp.picture)
        };
      } else {
        this.currentUser = undefined;
      }
    });
  }
}
