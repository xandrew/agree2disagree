import { Component, Input, OnInit } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { ClaimApiService } from '../claim-api.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-annotation-marker',
  templateUrl: './annotation-marker.component.html',
  styleUrls: ['./annotation-marker.component.scss']
})
export class AnnotationMarkerComponent implements OnInit {
  private _claimId: string | undefined = undefined;

  currentUserOpinion$: Observable<number | undefined> = of(undefined);
  disagreerOpinion$: Observable<number | undefined> = of(undefined);

  @Input()
  get claimId() { return this._claimId; }
  set claimId(claimId: string | undefined) {
    this._claimId = claimId;
    if (claimId === undefined) {
      this.currentUserOpinion$ = of(undefined);
      this.disagreerOpinion$ = of(undefined);
    } else {
      this.disagreerOpinion$ = this.usersService.disagreer$.pipe(
        switchMap(disagreerMeta => {
          if (disagreerMeta === undefined) {
            return of(undefined);
          } else {
            return this.api.getOpinion(
              claimId,
              disagreerMeta.email);
          }
        }),
        map(opinion => opinion?.value),
        map(opinion => {
          if (this.negated && (opinion !== undefined)) {
            return -opinion;
          }
          return opinion;
        }));

      this.currentUserOpinion$ =
        this.api.getOpinion(claimId).pipe(
          map(opinion => opinion?.value),
          map(opinion => {
            if (this.negated && (opinion !== undefined)) {
              return -opinion;
            }
            return opinion;
          }));
    }
  }

  @Input() negated = false;
  @Input() tooltip = "";

  constructor(
    private api: ClaimApiService,
    private usersService: UsersService) { }

  ngOnInit(): void {
  }
}
