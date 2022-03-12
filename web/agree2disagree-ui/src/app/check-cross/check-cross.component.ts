import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-check-cross',
  templateUrl: './check-cross.component.html',
  styleUrls: ['./check-cross.component.scss']
})
export class CheckCrossComponent implements OnInit {
  @Input() currentUserOpinion: number | undefined | null = undefined;
  @Input() disagreerOpinion: number | undefined | null = undefined;

  // Opacity values
  get cuno() { return 100 * Math.max(0, -(this.currentUserOpinion ?? 0)) };
  get dano() { return 100 * Math.max(0, -(this.disagreerOpinion ?? 0)) };
  get cuyo() { return 100 * Math.max(0, this.currentUserOpinion ?? 0) };
  get dayo() { return 100 * Math.max(0, this.disagreerOpinion ?? 0) };

  constructor() { }

  ngOnInit(): void {
  }

}
