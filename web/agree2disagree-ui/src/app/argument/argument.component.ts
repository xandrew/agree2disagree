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
  @Input() argumentMeta: ArgumentMeta =
    { id: '', textId: '', isAgainst: false };
  @Input() selectionList: SelectionList = new SelectionList();
  @Input() hasOpinion: boolean = false;
  @Input() disagreerSelectionOrdinal: number | undefined = undefined;

  private _selectedCounter = "";

  @Input()
  get selectedCounter() { return this._selectedCounter; }
  set selectedCounter(selectedCounter) {
    this._selectedCounter = selectedCounter;
    this.orderCounters();
    this.rewind(
      this.orderedCounters.findIndex(counter => counter.id === selectedCounter))
  }

  private _disagreerSelectedCounter = "";

  @Input()
  get disagreerSelectedCounter() { return this._disagreerSelectedCounter; }
  set disagreerSelectedCounter(selectedCounter) {
    this._disagreerSelectedCounter = selectedCounter;
    this.orderCounters();
  }

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
    console.log("Argument initialized");
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

  orderCounters() {
    this.orderedCounters = [...this.counters];
    const sortValue = (counter: CounterMeta) => {
      if (counter.id === this._selectedCounter) return 0;
      else return 1;
    }
    this.orderedCounters.sort(
      (c1, c2) => { return sortValue(c1) - sortValue(c2); });
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
    this.displayPosition = this.displayPosition + idx;
  }

  doSelectCounter(counterId: string, e: Event) {
    e.stopPropagation();
    this.selectCounter.emit(counterId);
  }

  hovered = false;
  get newSelectionOrdinal() {
    if (!this.hovered || !this.hasOpinion) {
      return undefined;
    }
    if (this.selectionList.isSelected(this.argumentId)) {
      return undefined;
    }
    return Math.max(
      this.selectionList.list.length, this.selectionList.maxSize);
  }

  beltHovered = false;
  private _rewindingTo: number | undefined = undefined;
  rewind(to = 0) {
    if (to < 0) {
      return;
    }
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
}
