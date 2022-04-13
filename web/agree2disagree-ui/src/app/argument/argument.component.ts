import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject, switchMap } from 'rxjs';
import { ArgumentMeta, CounterMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { SelectionList } from '../selection-list';
import { trigger, style, animate, transition } from '@angular/animations';
import { UsersService } from '../users.service';
@Component({
  selector: 'app-argument',
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.scss'],
  animations: [
    trigger('counterBeltTrigger', [
      transition(':enter', [
        style({ 'flex-basis': '0px' }),
        animate('200ms', style({ 'flex-basis': '*' })),
      ]),
      transition(':leave', [
        animate('200ms', style({ 'flex-basis': '0px' }))
      ])
    ])
  ]
})
export class ArgumentComponent implements OnInit {
  @Input() claimId = "";
  @Input() argumentMeta!: ArgumentMeta;
  @Input() selectionList!: SelectionList;
  @Input() disagreerSelectionList!: SelectionList;
  @Input() opinion: number | undefined;
  @Input() disagreerOpinion: number | undefined;

  private _selectedCounter = "";

  @Input()
  get selectedCounter() { return this._selectedCounter; }
  set selectedCounter(selectedCounter) {
    this._selectedCounter = selectedCounter;
    this.orderCounters();
    const selectedIdx = this.orderedCounters.findIndex(
      counter => counter.id === selectedCounter);
    if (selectedIdx >= 0) {
      this.rewind(selectedIdx);
    }
  }

  private _disagreerSelectedCounter = "";

  @Input()
  get disagreerSelectedCounter() { return this._disagreerSelectedCounter; }
  set disagreerSelectedCounter(selectedCounter) {
    this._disagreerSelectedCounter = selectedCounter;
    this.orderCounters();
  }

  @Output() newArgumentFinished = new EventEmitter<void>();
  @Output() selectCounter = new EventEmitter<string>();

  displayPosition = 0;

  get argumentId() { return this.argumentMeta.id; }

  addingCounter = false;
  counters: CounterMeta[] = [];
  orderedCounters: CounterMeta[] = [];

  private reloadCounters = new Subject<[string, string]>();

  constructor(private api: ClaimApiService,
    private usersService: UsersService) { }


  get currentUser() {
    return this.usersService.currentUser;
  }
  get disagreer() {
    return this.usersService.disagreer;
  }

  ngOnInit(): void {
    if (this.argumentMeta.id === '#NEW') {
      this.editArgument();
    }
    this.reloadCounters.pipe(
      switchMap(claimAndArg => {
        return this.api.loadCounters(...claimAndArg);
      })).subscribe(counters => {
        this.counters = counters;
        this.orderCounters();
      });
    this.reload();
  }

  reload() {
    this.reloadCounters.next([this.claimId, this.argumentMeta.id]);
    this.addingCounter = false;
  }

  counterSaved(counterId: string) {
    this.displayPosition = 0;
    if (counterId !== '') {
      this.selectCounter.emit(counterId);
      this.reload();
    } else {
      // TODO: We shoud notify the user somehow that her edit failed
    }
  }

  orderCounters() {
    this.orderedCounters = [...this.counters];
    const aid = this.argumentId;

    // For an argument selected by one user we prefer the counter of the
    // other user, so the more preferred it is, the less value it gets.
    // Still, a selected counter by any user worth more then a non-selected one,
    // regardless of argument selection.
    let currentUserValue = 6;
    if (this.selectionList.isSelected(aid)) {
      currentUserValue = this.selectionList.selectionOrdinal(aid);
    }
    let disagreerValue = 6;
    if (this.disagreerSelectionList.isSelected(aid)) {
      disagreerValue = this.disagreerSelectionList.selectionOrdinal(aid);
    }

    // If argument selection is the same we use opinion value and email
    // order as final disambiguator.
    const currentUserWeightBonus =
      ((this.usersService.currentUser?.email ?? '') >
        (this.usersService.disagreer?.email ?? '')) ? 0.001 : -0.001;
    if (this.argumentMeta.isAgainst) {
      currentUserValue +=
        -(this.opinion ?? 0) / 3. + currentUserWeightBonus;
      disagreerValue +=
        -(this.disagreerOpinion ?? 0) / 3. - currentUserWeightBonus;
    } else {
      currentUserValue +=
        (this.opinion ?? 0) / 3. - currentUserWeightBonus;
      disagreerValue +=
        (this.disagreerOpinion ?? 0) / 3. + currentUserWeightBonus;
    }

    const sortValue = (counter: CounterMeta) => {
      if (counter.id === this._selectedCounter) return currentUserValue;
      if (counter.id === this._disagreerSelectedCounter) return disagreerValue;
      return 0;
    }
    this.orderedCounters.sort(
      (c1, c2) => { return sortValue(c2) - sortValue(c1); });
  }

  beltTrackBy = (_i: number, idx: number) => {
    if (this.displayPosition + idx < 0) {
      return 'start';
    }
    if (this.displayPosition + idx >= this.counters.length) {
      return 'end';
    }
    return this.counters[this.displayPosition + idx].id;
  }

  repositionBelt(idx: number) {
    if (idx === 0) {
      this.lookingCloser = !this.lookingCloser;
      if (!this.lookingCloser) {
        this.rewind();
      }
    } else {
      this.displayPosition = this.displayPosition + idx;
    }
  }

  doSelectCounter(counterId: string, e: Event) {
    e.stopPropagation();
    this.selectCounter.emit(counterId);
  }

  hovered = false;
  get newSelectionOrdinal() {
    if (!this.hovered) {
      return undefined;
    }
    if (this.selectionList.isSelected(this.argumentId)) {
      return undefined;
    }
    return Math.min(
      this.selectionList.list.length + 1, this.selectionList.maxSize);
  }

  lookingCloser = false;
  lookCloser() {
    console.log("Please look closer!");
    this.lookingCloser = true;
  }

  private _rewindingTo: number | undefined = undefined;
  rewind(to = 0) {
    this._rewindingTo = to;
    this.nextRewindStep();
  }

  nextRewindStep() {
    if (this._rewindingTo !== undefined) {
      if (this.displayPosition !== this._rewindingTo) {
        this.displayPosition += Math.sign(
          this._rewindingTo - this.displayPosition);
      } else {
        this._rewindingTo = undefined;
      }
    }
  }

  stopPropOnZero(idx: number, event: Event) {
    if (idx === 0) {
      event.stopPropagation();
    }
  }

  replaceCounterId = '';
  counterStartingText = '';

  addCounter() {
    this.usersService.needsLogin$.subscribe(_ => {
      this.addingCounter = true;
      this.lookingCloser = false;
      this.replaceCounterId = '';
      this.counterStartingText = '';
      this.rewind(-1);
    });
  }

  editCounter(counter: CounterMeta) {
    this.usersService.needsLogin$.subscribe(_ => {
      this.addingCounter = true;
      this.lookingCloser = false;
      this.replaceCounterId = counter.id;
      this.counterStartingText = counter.text.text;
      this.rewind(-1);
    });
  }

  careToWriteCounter(e: Event) {
    e.stopPropagation();
    this.addCounter();
  }

  cancelNewCounter() {
    this.addingCounter = false;
    this.rewind(0);
  }

  get disagreerSelectionOrdinal() {
    return this.disagreerSelectionList.selectionOrdinal(this.argumentId);
  }

  editMeta?: ArgumentMeta

  canceledArgumentEdit() {
    this.editMeta = undefined;
    this.newArgumentFinished.emit()
  }

  editArgument() {
    this.editMeta = JSON.parse(JSON.stringify(this.argumentMeta));
  }

  forkArgument() {
    this.editArgument();
    this.editMeta!.forkedFrom = this.editMeta!.id;
    this.editMeta!.id = '#NEW';
  }

  savedArgument(argumentId: string) {
    if (this.argumentMeta.id === '#NEW') {
      this.newArgumentFinished.emit();
      this.selectionList.addAsFirst(argumentId);
    }
    if (this.editMeta!.forkedFrom) {
      let forkedFrom = this.editMeta!.forkedFrom;
      if (this.selectionList.isSelected(forkedFrom)) {
        this.selectionList.replace(forkedFrom, argumentId);
      } else {
        this.selectionList.add(argumentId);
      }
    }
    this.editMeta = undefined;
  }
}
