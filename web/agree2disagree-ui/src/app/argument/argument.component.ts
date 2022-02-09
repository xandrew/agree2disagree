import { Component, OnInit, Input } from '@angular/core';
import { ArgumentMeta } from '../ajax-interfaces';

@Component({
  selector: 'app-argument',
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.scss']
})
export class ArgumentComponent implements OnInit {
  @Input() argumentMeta: ArgumentMeta =
    { id: '', text: '', author: '', isAgainst: false };
  constructor() { }

  ngOnInit(): void {
  }
}
