import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { of, Observable, Subject, Subscription, combineLatest, forkJoin } from 'rxjs';

import { ArgumentMeta, ClaimMeta, CounterDict } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { SelectionList } from '../selection-list';
import { UsersService } from '../users.service';

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
export class ClaimComponent implements OnInit, OnDestroy {

  constructor(
    private api: ClaimApiService,
    private route: ActivatedRoute,
    private usersService: UsersService) { }

  readonly OpinionClass = OpinionClass;

  claimId = '';
  addingArgument = false;

  args: ArgumentMeta[] = [];

  opinion: number | undefined = 0;

  selectedArgumentsFor = new SelectionList(5, () => this.opinionChanged());
  selectedArgumentsAgainst = new SelectionList(5, () => this.opinionChanged());

  alma = (counterId: string) => { this.selectedCounters[this.args[0].id] = counterId; };

  selectedCounters: CounterDict = {};

  get opinionSlider() { return -(this.opinion ?? 0); }
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

  private subs: Subscription = new Subscription();

  textId$: Observable<string> = of();

  ngOnInit(): void {
    const claimId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id') || ''));

    this.textId$ = claimId$.pipe(
      switchMap((claimId: string) => {
        return this.api.loadClaim(claimId);
      }),
      map((claimMeta: ClaimMeta) => claimMeta.textId || ''));

    this.subs.add(claimId$.pipe(
      switchMap((claimId: string) => {
        this.opinion = undefined;
        return this.api.getOpinion(claimId);
      })).subscribe(opinion => {
        this.opinion = opinion.value;
        this.selectedArgumentsFor.list = opinion.selectedArgumentsFor ?? [];
        this.selectedArgumentsAgainst.list =
          opinion.selectedArgumentsAgainst ?? [];
        this.selectedCounters = opinion.selectedCounters ?? {};
        this.orderArgs();
      }));

    this.subs.add(this.reloadArguments.pipe(
      switchMap(claimId => {
        if (this.claimId != claimId) {
          this.args = [];
          this.claimId = claimId;
        }
        return this.api.loadArguments(claimId);
      })).subscribe(args => {
        this.args = args;
        this.orderArgs();
      }));

    this.subs.add(claimId$.subscribe(this.reloadArguments));

    combineLatest(claimId$, this.usersService.disagreers$).pipe(
      switchMap(candu => {
        let claimId = candu[0];
        let users = candu[1];
        let obs = users.map(user => this.api.getOpinion(claimId, user.email));
        return forkJoin(obs);
      }))
      .subscribe(a => {
        console.log(a);
      });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  newArgumentSaved() {
    this.reloadArguments.next(this.claimId);
    this.addingArgument = false;
  }

  selectCounter(argumentId: string, counterId: string) {
    this.selectedCounters[argumentId] = counterId;
    this.opinionChanged();
  }

  opinionChanged() {
    this.api.setOpinion(
      this.claimId,
      this.opinion!,
      this.selectedArgumentsFor.list,
      this.selectedArgumentsAgainst.list,
      this.selectedCounters).subscribe();
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
