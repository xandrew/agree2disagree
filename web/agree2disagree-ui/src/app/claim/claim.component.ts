import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ArgumentMeta } from '../ajax-interfaces';
import { ClaimApiService } from '../claim-api.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent implements OnInit {

  constructor(
    private api: ClaimApiService,
    private route: ActivatedRoute) { }

  claimId = '';
  text = '';
  addingArgument = false;

  args: ArgumentMeta[] = [];

  private reloadArguments = new Subject<string>();

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.claimId = params.get('id') || '';
        this.addingArgument = false;
        return this.api.loadClaim(this.claimId);
      })).subscribe(resp => {
        this.text = resp.text;
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
