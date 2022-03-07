import { Component, OnInit, Input } from '@angular/core';
import { UserMeta } from '../user-meta';
import { trigger, style, state, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.scss'],
  animations: [
    trigger('expansionTrigger', [
      state('small', style({
        width: '0px',
        height: '0px',
      })),
      state('big', style({
        width: '40px',
        height: '40px',
      })),
      transition('small => big', [
        animate('200ms', style({ 'width': '40px' })),
        animate('200ms')
      ]),
      transition('big => small', [
        animate('400ms')
      ])
    ])
  ]
})
export class UserBadgeComponent implements OnInit {
  @Input() user: UserMeta = { email: '', givenName: '', picture: '' };
  @Input() expanded: boolean = true;
  @Input() color: string = 'red';

  constructor() { }

  ngOnInit(): void {
  }

}
