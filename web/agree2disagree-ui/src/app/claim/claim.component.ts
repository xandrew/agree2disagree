import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { exhaustMap, map, switchMap } from 'rxjs/operators';
import { of, Observable, Subscription, timer, combineLatest } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';

import { ArgumentDiff, ArgumentMeta, CounterDict, CounterSelectionState, DiffType } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { SelectionList } from '../selection-list';
import { UsersService } from '../users.service';
import { MatDialog } from '@angular/material/dialog';
import { DisagreerInviteComponent } from '../disagreer-invite/disagreer-invite.component';

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
  styleUrls: ['./claim.component.scss'],
  animations: [
    trigger('argumentInOutTrigger', [
      transition(':enter', [
        style({ 'height': '0px', 'transform': 'scale(1, 0)' }),
        animate('200ms', style({ 'height': '*', 'transform': '*' })),
      ]),
      transition(':leave', [
        animate(
          '200ms', style({ 'height': '0px', 'transform': 'scale(1, 0)' }))
      ])
    ])
  ]
})
export class ClaimComponent implements OnInit, OnDestroy {

  constructor(
    private api: ClaimApiService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private dialog: MatDialog) { }

  readonly OpinionClass = OpinionClass;

  claimId = '';
  addingArgument = false;

  args: ArgumentMeta[] = [];

  opinion: number | undefined = 0;
  selectedArgumentsFor = new SelectionList(() => this.opinionChanged());
  selectedArgumentsAgainst = new SelectionList(() => this.opinionChanged());
  selectedCounters: CounterDict = {};

  disagreerOpinion: number | undefined = 0;
  disagreerSelectedArgumentsFor = new SelectionList();
  disagreerSelectedArgumentsAgainst = new SelectionList();
  disagreerSelectedCounters: CounterDict = {};

  get opinionSlider() { return -(this.opinion ?? 0); }
  set opinionSlider(opinionSlider: number | null) {
    if (opinionSlider === null) return;
    this.usersService.needsLogin$.subscribe(_ => {
      this.opinion = -opinionSlider;
      this.opinionChanged();
    });
  }

  clickSliderDiv(e: MouseEvent) {
    this.usersService.needsLogin$.subscribe(_ => {
      const target = e.target as HTMLElement;
      const divWidth = target.offsetWidth;
      const usefulLength = divWidth - 16;
      const position = Math.max(0, e.offsetX - 8);
      if (usefulLength > 0) {
        const ratio = position / usefulLength;
        const opinion = 1 - 2 * ratio;
        this.opinion = opinion;
        this.opinionChanged();
      }
    });
  }

  get disagreerOpinionSlider() {
    return -(this.disagreerOpinion ?? 0);
  }

  get opinionClass() {
    if (this.opinion === undefined) return undefined;
    if (this.opinion < -0.75) return OpinionClass.STRONGLY_DISAGREE;
    if (this.opinion < -0.25) return OpinionClass.DISAGREE;
    if (this.opinion > 0.75) return OpinionClass.STRONGLY_AGREE;
    if (this.opinion > 0.25) return OpinionClass.AGREE;
    return OpinionClass.NOT_SURE;
  }

  private subs: Subscription = new Subscription();

  text$!: Observable<string>;

  ngOnInit(): void {
    const claimId$ = this.route.paramMap.pipe(
      map(params => params.get('id') || ''));

    this.route.queryParamMap.subscribe(
      queryParams => {
        const disagreer = queryParams.get('disagreer')
        if (disagreer) {
          this.usersService.needsLogin$.subscribe(_ => {
            this.usersService.addDisagreer(disagreer).subscribe();
          });
        }
      });

    this.text$ = claimId$.pipe(
      switchMap(claimId => {
        return this.api.loadClaim(claimId);
      }),
      map((claimMeta) => claimMeta.text.text));

    this.subs.add(claimId$.pipe(
      switchMap(claimId => {
        this.opinion = undefined;
        this.selectedArgumentsFor.list = [];
        this.selectedArgumentsAgainst.list = [];
        this.selectedCounters = {};
        return this.api.pollOpinion(claimId);
      })).subscribe(opinion => {
        this.opinion = opinion.value;
        this.selectedArgumentsFor.list = opinion.selectedArgumentsFor;
        this.selectedArgumentsAgainst.list = opinion.selectedArgumentsAgainst;
        this.selectedCounters = opinion.selectedCounters;
        this.orderArgs();
      }));

    this.subs.add(claimId$.pipe(
      switchMap(claimId => {
        if (this.claimId != claimId) {
          this.args = [];
          this.claimId = claimId;
        }
        return timer(0, 2000).pipe(
          exhaustMap(_ => {
            return this.api.loadArguments(claimId);
          }));
      })).subscribe(args => {
        this.args = args;
        this.orderArgs();
      }));

    this.subs.add(combineLatest([claimId$, this.usersService.disagreer$]).pipe(
      switchMap(([claimId, disagreer]) => {
        this.disagreerOpinion = undefined;
        this.disagreerSelectedArgumentsFor.list = [];
        this.disagreerSelectedArgumentsAgainst.list = [];
        this.disagreerSelectedCounters = {};
        if (disagreer !== undefined) {
          return this.api.pollOpinion(claimId, disagreer.email);
        }
        else {
          return of();
        }
      }))
      .subscribe(opinion => {
        this.disagreerOpinion = opinion.value;
        this.disagreerSelectedArgumentsFor.list = opinion.selectedArgumentsFor;
        this.disagreerSelectedArgumentsAgainst.list =
          opinion.selectedArgumentsAgainst;
        this.disagreerSelectedCounters = opinion.selectedCounters;
        this.orderArgs();
      }));
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  newArgumentMeta?: ArgumentMeta;
  addArgument(against: boolean) {
    this.usersService.needsLogin$.subscribe(_ => {
      this.newArgumentMeta = {
        id: '#NEW',
        text: {
          id: '',
          text: '',
          annotations: [],
        },
        isAgainst: against,
        editable: true,
        forkHistory: [],
      };
    });
  }

  selectCounter(argumentId: string, counterId: string) {
    if (counterId === '') {
      delete this.selectedCounters[argumentId];
    } else {
      this.selectedCounters[argumentId] = counterId;
    }
    this.opinionChanged();
  }

  opinionChanged() {
    this.api.setOpinion(
      this.claimId,
      this.opinion,
      this.selectedArgumentsFor.list,
      this.selectedArgumentsAgainst.list,
      this.selectedCounters).subscribe();
    this.orderArgs();
  }

  orderOneSide(
    args: ArgumentMeta[],
    user1Weight: number,
    user1Selection: SelectionList,
    user2Weight: number,
    user2Selection: SelectionList) {

    function sortValue(arg: ArgumentMeta) {
      let value = 0;
      const aid = arg.id;
      if (user1Selection.isSelected(aid)) {
        value += user1Weight * (6 - user1Selection.selectionOrdinal(aid));
      }
      if (user2Selection.isSelected(aid)) {
        value += user2Weight * (6 - user2Selection.selectionOrdinal(aid));
      }
      return value;
    }
    args.sort((a1, a2) => sortValue(a2) - sortValue(a1));
  }

  orderArgs() {
    const argsFor = this.args.filter(arg => { return !arg.isAgainst; });
    const argsAgainst = this.args.filter(arg => { return arg.isAgainst; });

    // Just for deterministic tie breaking.
    const currentUserWeightBonus =
      ((this.usersService.currentUser?.email ?? '') >
        (this.usersService.disagreer?.email ?? '')) ? 0.001 : -0.001;

    this.orderOneSide(
      argsFor,
      (this.opinion ?? 0) + 2 + currentUserWeightBonus,
      this.selectedArgumentsFor,
      (this.disagreerOpinion ?? 0) + 2 - currentUserWeightBonus,
      this.disagreerSelectedArgumentsFor);

    this.orderOneSide(
      argsAgainst,
      -(this.opinion ?? 0) + 2 - currentUserWeightBonus,
      this.selectedArgumentsAgainst,
      -(this.disagreerOpinion ?? 0) + 2 + currentUserWeightBonus,
      this.disagreerSelectedArgumentsAgainst);


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

  argumentTrackBy = (_: number, arg: ArgumentMeta) => {
    return arg.id;
  }

  shareClaim() {
    this.usersService.needsLogin$.subscribe(_ => {
      this.dialog.open(DisagreerInviteComponent);
    });
  }

  getCounterSelection(
    selections: CounterDict,
    argumentMeta: ArgumentMeta): CounterSelectionState {
    if (selections.hasOwnProperty(argumentMeta.id)) {
      return {
        preferredCounter: selections[argumentMeta.id],
        isInherited: false,
      };
    }
    for (const anchestorId of argumentMeta.forkHistory) {
      if (selections.hasOwnProperty(anchestorId)) {
        return {
          preferredCounter: selections[anchestorId],
          isInherited: true,
        };
      }
    }
    return {
      preferredCounter: '',
      isInherited: false,
    };
  }

  shouldScrollTo: string = '';

  argumentAnimation(argumentId: string, finished: boolean) {
    if (argumentId === this.shouldScrollTo) {
      const anchor = `argument-${argumentId}`;
      const e = document.getElementById(anchor);
      if (e) {
        const boundingRect = e.getBoundingClientRect();
        if ((boundingRect.top < 0) ||
          (boundingRect.bottom > window.innerHeight)) {
          if (finished) {
            e.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            e.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else {
        console.log(`Couldn't find anchor ${anchor}`);
      }
      this.shouldScrollTo = '';
    }
  }

  argumentDiff(diff: ArgumentDiff) {
    if (diff.diffType === DiffType.Delete) {
      const idx = this.args.findIndex(arg => arg.id === diff.argumentMeta.id);
      if (idx >= 0) {
        this.args.splice(idx, 1);
        this.orderArgs();
      }
    } else if (diff.diffType === DiffType.Add) {
      this.args.push(diff.argumentMeta);
      this.orderArgs();
      this.shouldScrollTo = diff.argumentMeta.id;
    }
  }
}
