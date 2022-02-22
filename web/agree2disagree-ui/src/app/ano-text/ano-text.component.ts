import { Component, OnInit, Input } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ano-text',
  templateUrl: './ano-text.component.html',
  styleUrls: ['./ano-text.component.scss']
})
export class AnoTextComponent implements OnInit {
  private _textId = '';

  @Input()
  get textId() { return this._textId; }
  set textId(textId: string) {
    this._textId = textId;
    this.reload(textId);
  }

  constructor(private api: ClaimApiService) { }

  text = '';

  private reloadText = new ReplaySubject<string>(1);

  ngOnInit(): void {
    this.reloadText.pipe(
      switchMap(textId => {
        return this.api.loadText(textId);
      })).subscribe(anoText => {
        this.text = anoText.text;
      });
  }

  selecting(e: Event) {
    let target = e.target as HTMLTextAreaElement;
    console.log("xyz", target.selectionStart, target.selectionEnd);
  }

  private reload(textId: string) {
    if (textId !== '') {
      this.reloadText.next(textId);
    }
  }
}
