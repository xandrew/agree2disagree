import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClaimSelectorComponent } from '../claim-selector/claim-selector.component';
import { AnnotationMeta } from '../ajax-interfaces';

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
  selectionStart = 0;
  selectionEnd = 0;
  textSelected = '';

  annotations: AnnotationMeta[] = [];

  private reloadText = new ReplaySubject<string>(1);

  ngOnInit(): void {
    this.reloadText.pipe(
      switchMap(textId => {
        return this.api.loadText(textId);
      })).subscribe(anoText => {
        this.setText(anoText.text);
        this.annotations = anoText.annotations;
      });
  }

  private reload(textId: string) {
    if (textId !== '') {
      this.reloadText.next(textId);
    }
  }

  private setText(text: string) {
    this.text = text;
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
        this.selectionStart = range.startOffset - 1;
        this.selectionEnd = range.endOffset - 1;
        this.textSelected = this.text.substring(
          this.selectionStart, this.selectionEnd);
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
        textFragment: this.textSelected
      }
    });

    dialogRef.afterClosed().subscribe(r => {
      if (r) {
        let result = r as [string, boolean];
        this.api.newAnnotation(
          this.textId,
          result[0],
          result[1],
          this.selectionStart,
          this.selectionEnd).subscribe(_a => {
            this.reload(this.textId);
          });
      }
    });
  }
}
