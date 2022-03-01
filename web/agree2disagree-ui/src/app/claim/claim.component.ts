import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ArgumentMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';

enum OpinionClass {
  STRONGLY_DISAGREE,
  DISAGREE,
  NOT_SURE,
  AGREE,
  STRONGLY_AGREE,
}

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent implements OnInit {

  constructor(
    private api: ClaimApiService,
    private route: ActivatedRoute) { }

  readonly OpinionClass = OpinionClass;

  claimId = '';
  textId = '';
  addingArgument = false;

  args: ArgumentMeta[] = [];

  opinion: number | undefined = 0;

  get opinionSlider() { return -(this.opinion || 0); }
  set opinionSlider(opinionSlider: number | null) {
    if (opinionSlider === null) return;
    this.opinion = -opinionSlider;
    this.api.setOpinion(this.claimId, -opinionSlider).subscribe();
  }

  opinionClass() {
    if (this.opinion === undefined) return undefined;
    if (this.opinion < -0.75) return OpinionClass.STRONGLY_DISAGREE;
    if (this.opinion < -0.25) return OpinionClass.DISAGREE;
    if (this.opinion > 0.75) return OpinionClass.STRONGLY_AGREE;
    if (this.opinion > 0.25) return OpinionClass.AGREE;
    return OpinionClass.NOT_SURE;
  }

  private reloadArguments = new Subject<string>();

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.claimId = params.get('id') || '';
        this.addingArgument = false;
        this.api.getOpinion(this.claimId).subscribe(opinion => {
          this.opinion = opinion.value;
        });
        return this.api.loadClaim(this.claimId);
      })).subscribe(resp => {
        this.textId = resp.textId;
        this.reloadArguments.next(resp.id);
      });

    this.reloadArguments.pipe(
      switchMap(claimId => {
        return this.api.loadArguments(claimId);
      })).subscribe(args => {
        this.args = args;
      });
  }

  newArgumentSaved() {
    this.reloadArguments.next(this.claimId);
    this.addingArgument = false;
  }
}
