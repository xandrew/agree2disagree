import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { ClaimApiService } from '../claim-api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClaimSelectorComponent } from '../claim-selector/claim-selector.component';
import { AnnotationMeta } from '../ajax-interfaces';
import { Router } from '@angular/router';

interface Stuff {
  pos: number;
  annotation?: AnnotationMeta;
  text?: string;
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
    private router: Router) { }

  text = '';
  annotations: AnnotationMeta[] = [];

  dispList: Stuff[] = [];

  selected = false;
  selectionStart = 0;
  selectionEnd = 0;
  textSelected = '';

  highlightStart = 0;
  highlightEnd = 0;

  private reloadText = new ReplaySubject<string>(1);

  ngOnInit(): void {
    this.reloadText.pipe(
      switchMap(textId => {
        return this.api.loadText(textId);
      })).subscribe(anoText => {
        this.text = anoText.text;
        this.annotations = anoText.annotations;
        this.computeTextFregments(anoText.text, anoText.annotations);
      });
  }

  private reload(textId: string) {
    if (textId !== '') {
      this.reloadText.next(textId);
    }
  }

  private computeTextFregments(text: string, annotations: AnnotationMeta[]) {
    let stuffList: Stuff[] = [{ pos: text.length }];
    for (let a of annotations) {
      stuffList.push({ pos: a.startInText, annotation: a });
      stuffList.push({ pos: a.endInText });
    }
    stuffList.sort((a1, a2) => a1.pos - a2.pos);
    let lastPos = 0;
    this.dispList = [];
    for (let stuff of stuffList) {
      if (stuff.pos > lastPos) {
        this.dispList.push(
          { pos: lastPos, text: text.substring(lastPos, stuff.pos) });
        lastPos = stuff.pos;
      }
      if (stuff.annotation !== undefined) {
        this.dispList.push(stuff);
      }
    }
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


  @HostListener('document:selectionchange')
  onSelectionChange() {
    let selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      if (!range.collapsed && this.selectionWithinText(range)) {
        let sPos = this.findPosData(range.startContainer);
        let ePos = this.findPosData(range.endContainer);
        if (sPos !== undefined && ePos !== undefined) {
          this.selected = true;
          this.selectionStart = sPos[0];
          if (sPos[1]) {
            this.selectionStart += range.startOffset - 1;
          }
          this.selectionEnd = ePos[0];
          if (ePos[1]) {
            this.selectionEnd += range.endOffset - 1;
          }
          this.textSelected = this.text.substring(
            this.selectionStart, this.selectionEnd);
          return;
        }
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
          this._textId,
          result[0],
          result[1],
          this.selectionStart,
          this.selectionEnd).subscribe(_a => {
            this.reload(this._textId);
          });
      }
    });
  }

  doHiglight(a: AnnotationMeta) {
    this.highlightStart = a.startInText;
    this.highlightEnd = a.endInText;
  }
  undoHighlight() {
    this.highlightStart = 0;
    this.highlightEnd = 0;
  }

  tooltipFor(a: AnnotationMeta) {
    return `Implies/assumes "${a.claimText}" is ${!a.negated}.`;
  }

  goToClaim(claimId: string) {
    this.router.navigate(['claim', claimId]);
  }
}
