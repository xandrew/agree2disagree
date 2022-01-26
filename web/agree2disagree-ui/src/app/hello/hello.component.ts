import { Component, OnInit } from '@angular/core';

import { UserModule } from '../user/user.module';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent implements OnInit {

  constructor(public user: UserModule) { }


  ngOnInit(): void {
  }

}
