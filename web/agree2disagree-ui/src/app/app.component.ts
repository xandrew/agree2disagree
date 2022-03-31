import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'agree2disagree-ui';

  constructor(private router: Router) {
  }

  goHome() {
    console.log('Going home');
    this.router.navigate(['']);
  }
}
