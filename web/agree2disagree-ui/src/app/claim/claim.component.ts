import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ArgumentMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { SelectionList } from '../selection-list';

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

  selectedArgumentsFor = new SelectionList(5, () => this.opinionChanged());
  selectedArgumentsAgainst = new SelectionList(5, () => this.opinionChanged());

  get opinionSlider() { return -(this.opinion || 0); }
  set opinionSlider(opinionSlider: number | null) {
    if (opinionSlider === null) return;
    this.opinion = -opinionSlider;
    this.opinionChanged();
  }

  get opinionClass() {
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
          this.selectedArgumentsFor.list = opinion.selectedArgumentsFor || [];
          this.selectedArgumentsAgainst.list =
            opinion.selectedArgumentsAgainst || [];
          this.orderArgs();
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
        this.orderArgs();
      });
  }

  newArgumentSaved() {
    this.reloadArguments.next(this.claimId);
    this.addingArgument = false;
  }

  opinionChanged() {
    this.api.setOpinion(
      this.claimId,
      this.opinion!,
      this.selectedArgumentsFor.list,
      this.selectedArgumentsAgainst.list).subscribe();
    this.orderArgs();
  }

  orderArgs() {
    const argsFor = this.args.filter(arg => { return !arg.isAgainst; });
    const argsAgainst = this.args.filter(arg => { return arg.isAgainst; });
    this.selectedArgumentsFor.sortArgs(argsFor);
    this.selectedArgumentsAgainst.sortArgs(argsAgainst);
    this.args = [];
    for (let i = 0; i < Math.max(argsFor.length, argsAgainst.length); i++) {
      if (i < argsFor.length) {
        this.args.push(argsFor[i]);
      }
      if (i < argsAgainst.length) {
        this.args.push(argsAgainst[i]);
      }
    }
  }
}
