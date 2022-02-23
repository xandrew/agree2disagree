import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClaimSelectorComponent } from '../claim-selector/claim-selector.component';

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

  constructor(
    private api: ClaimApiService,
    private elementRef: ElementRef,
    private dialog: MatDialog) { }

  text = '';
  selected = false;

  words: string[] = [];
  wands: [string, number][] = [];

  private reloadText = new ReplaySubject<string>(1);

  ngOnInit(): void {
    this.reloadText.pipe(
      switchMap(textId => {
        return this.api.loadText(textId);
      })).subscribe(anoText => {
        this.setText(anoText.text);
      });
  }

  private reload(textId: string) {
    if (textId !== '') {
      this.reloadText.next(textId);
    }
  }

  private setText(text: string) {
    this.text = text;
    this.words = text.split(' ');
    let start = 0;
    this.wands = this.words.map(w => {
      let res: [string, number] = [w, start];
      start += w.length + 1;
      return res;
    });
  }

  private selectionWithinText(range: Range) {
    let hostElement = this.elementRef.nativeElement as HTMLElement;
    let selectionContainer = range.commonAncestorContainer;
    if (!hostElement.contains(selectionContainer)) {
      return false;
    }
    let tdiv = hostElement.getElementsByClassName('text-cont')[0];
    if (!tdiv.contains(selectionContainer)) {
      return false;
    }
    return true;
  }

  @HostListener('document:selectionchange')
  onSelectionChange() {
    let selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      if (!range.collapsed && this.selectionWithinText(range)) {
        this.selected = true;
        return;
      }
    }
    this.selected = false;
  }

  annotate() {
    const dialogRef = this.dialog.open(ClaimSelectorComponent, {
      width: '100vw',
      maxWidth: '500px',
      maxHeight: '85vh',
      restoreFocus: false,
      autoFocus: false,
      data: {
        textFragment: "Fragmentecske"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
      }
    });
  }
}
