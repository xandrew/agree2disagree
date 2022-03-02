import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject, switchMap } from 'rxjs';
import { ArgumentMeta, CounterMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';
import { SelectionList } from '../selection-list';

@Component({
  selector: 'app-argument',
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.scss']
})
export class ArgumentComponent implements OnInit {
  @Input() claimId = "";
  @Input() argumentMeta: ArgumentMeta =
    { id: '', textId: '', isAgainst: false };
  @Input() selectionList: SelectionList = new SelectionList(0, () => { });
  @Input() hasOpinion: boolean = false;

  get argumentId() { return this.argumentMeta.id; }

  addingCounter = false;
  counters: CounterMeta[] = [];

  private reloadCounters = new Subject<[string, string]>();

  constructor(private api: ClaimApiService) { }

  ngOnInit(): void {
    this.reloadCounters.pipe(
      switchMap(claimAndArg => {
        return this.api.loadCounters(...claimAndArg);
      })).subscribe(counters => {
        this.counters = counters;
      });
    this.reload();
  }

  reload() {
    this.reloadCounters.next([this.claimId, this.argumentMeta.id]);
    this.addingCounter = false;
  }
}
