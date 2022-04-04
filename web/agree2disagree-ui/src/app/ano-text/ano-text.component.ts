import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClaimSelectorComponent } from '../claim-selector/claim-selector.component';
import { AnnotationMeta } from '../ajax-interfaces';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

interface Stuff {
  pos: number;
  annotation?: AnnotationMeta;
  text?: string;
  isSelectionButton?: boolean;
}


@Component({
  selector: 'app-ano-text',
  templateUrl: './ano-text.component.html',
  styleUrls: ['./ano-text.component.scss']
})
export class AnoTextComponent implements OnInit {
  private _textId = '';

  @Input()
  get textId() { return this._textId; }
  set textId(textId: string | null) {
    this._textId = textId || '';
    this.reload(this._textId);
  }

  constructor(
    private api: ClaimApiService,
    private elementRef: ElementRef,
    private dialog: MatDialog,
    private router: Router,
    private usersService: UsersService) { }

  text = '';
  annotations: AnnotationMeta[] = [];

  dispList: Stuff[] = [];

  selected = false;
  selectionStart = 0;
  selectionEnd = 0;
  textSelected = '';

  highlightStart = 0;
  highlightEnd = 0;
  addHighlightStart = 0;
  addHighlightEnd = 0;

  private reloadText = new ReplaySubject<string>(1);

  ngOnInit(): void {
    this.reloadText.pipe(
      switchMap(textId => {
        return this.api.loadText(textId);
      })).subscribe(anoText => {
        this.text = anoText.text;
        this.annotations = anoText.annotations;
        this.computeTextFregments();
      });
  }

  private reload(textId: string) {
    if (textId !== '') {
      this.reloadText.next(textId);
    }
  }

  private computeTextFregments() {
    let stuffList: Stuff[] = [{ pos: this.text.length }];
    for (let a of this.annotations) {
      stuffList.push({ pos: a.startInText, annotation: a });
      stuffList.push({ pos: a.endInText });
    }
    if (this.selected) {
      stuffList.push({ pos: this.selectionStart, isSelectionButton: true });
      stuffList.push({ pos: this.selectionEnd });
      this.doAddHiglight(this.selectionStart, this.selectionEnd);
    } else {
      this.undoAddHighlight();
    }
    function sortValue(stuff: Stuff) {
      if (stuff.isSelectionButton) {
        return stuff.pos + 0.1;
      }
      return stuff.pos;
    }

    stuffList.sort((a1, a2) => sortValue(a1) - sortValue(a2));
    let lastPos = 0;
    this.dispList = [];
    for (let stuff of stuffList) {
      if (stuff.pos > lastPos) {
        this.dispList.push(
          { pos: lastPos, text: this.text.substring(lastPos, stuff.pos) });
        lastPos = stuff.pos;
      }
      if (stuff.annotation || stuff.isSelectionButton) {
        this.dispList.push(stuff);
      }
    }
  }

  trackStuffBy = (_i: number, stuff: Stuff) => {
    return `${stuff.pos}:${stuff.annotation?.id ?? ''}:${stuff.isSelectionButton ?? false}`;
  }

  private selectionWithinText(range: Range) {
    let hostElement = this.elementRef.nativeElement as HTMLElement;
    let selectionContainer = range.commonAncestorContainer;
    if (!hostElement.contains(selectionContainer)) {
      return false;
    }
    let tCont = hostElement.getElementsByClassName('text-cont')[0];
    if (!tCont.contains(selectionContainer)) {
      return false;
    }
    return true;
  }

  findPosData(startNode: Node): [number, boolean] | undefined {
    while (startNode.parentNode) {
      if (startNode instanceof HTMLElement) {
        if (startNode.dataset['startIdx'] !== undefined) {
          return [
            parseInt(startNode.dataset['startIdx']),
            startNode.dataset['shouldUseOffset'] === 'true'];
        }
      }
      startNode = startNode.parentNode;
    }
    return undefined
  }


  //@HostListener('document:selectionchange')
  checkSelectionChange(): boolean {
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      if (!range.collapsed && this.selectionWithinText(range)) {
        let sPos = this.findPosData(range.startContainer);
        let ePos = this.findPosData(range.endContainer);
        if (sPos !== undefined && ePos !== undefined) {
          this.selected = true;
          this.selectionStart = sPos[0];
          if (sPos[1]) {
            this.selectionStart += range.startOffset;
          }
          this.selectionEnd = ePos[0];
          if (ePos[1]) {
            this.selectionEnd += range.endOffset;
          }
          this.textSelected = this.text.substring(
            this.selectionStart, this.selectionEnd);
          this.computeTextFregments();
          function emptySelection() {
            document.getSelection()?.empty();
          }
          setTimeout(emptySelection);
          return true;
        }
      }
    }
    const prevSelected = this.selected;
    this.selected = false;
    this.computeTextFregments();
    return prevSelected !== this.selected;
  }

  private preventNextClick = false;
  onMouseUp() {
    if (this.checkSelectionChange()) {
      this.preventNextClick = true;
    }
  }

  maybeStopPropagation(e: Event) {
    if (this.preventNextClick) {
      this.preventNextClick = false;
      e.stopPropagation();
    }
  }

  annotate(e: Event) {
    e.stopPropagation();
    this.usersService.needsLogin$.subscribe(_ => {
      const dialogRef = this.dialog.open(ClaimSelectorComponent, {
        width: '100vw',
        maxWidth: '800px',
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
            this._textId,
            result[0],
            result[1],
            this.selectionStart,
            this.selectionEnd).subscribe(_a => {
              this.reload(this._textId);
            });
        }
        this.checkSelectionChange();
      });
    });
  }

  highlightAnnotation(a: AnnotationMeta) {
    this.doHiglight(a.startInText, a.endInText);
  }
  doHiglight(startInText: number, endInText: number) {
    this.highlightStart = startInText;
    this.highlightEnd = endInText;
  }
  undoHighlight() {
    this.highlightStart = 0;
    this.highlightEnd = 0;
  }
  doAddHiglight(startInText: number, endInText: number) {
    this.addHighlightStart = startInText;
    this.addHighlightEnd = endInText;
  }
  undoAddHighlight() {
    this.addHighlightStart = 0;
    this.addHighlightEnd = 0;
  }

  tooltipFor(a: AnnotationMeta) {
    return `Implies/assumes "${a.claimText}" is ${!a.negated}.`;
  }

  goToClaim(claimId: string) {
    this.router.navigate(['claim', claimId]);
  }
}
