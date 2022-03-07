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

  disagreers: UserMeta[] = [];
  disagreers$ = new BehaviorSubject<UserMeta[]>([]);

  static colors = ['blue', 'yellow', 'green', 'orange'];

  colorOf(idx: number) { return UsersService.colors[idx]; };

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.http.get<UserResponse>('/login_state').subscribe(resp => {
      if (resp.email) {
        this.currentUser = this.responseToMeta(resp);
      } else {
        this.currentUser = undefined;
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
          this.disagreers.push(this.responseToMeta(resp));
          this.disagreers$.next(this.disagreers);
          return true;
        }
        return false;
      }));
  }
}
