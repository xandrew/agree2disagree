import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})

export class UserModule {
  email = '';
  given_name = '';
  // picture: SafeUrl = ???;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    interface UserResponse {
      email: string;
      given_name: string;
     picture: string;
    }
    this.http.get<UserResponse>('/login_state').subscribe(resp => {
      if (resp.email) {
        this.email = resp.email;
	this.given_name = resp.given_name;
	//this.picture = this.sanitizer.bypassSecurityTrustUrl(resp.picture);
      }
    });
  }
}
