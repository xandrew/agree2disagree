import { ArgumentMeta } from "./ajax-interfaces";

export class SelectionList {
  constructor(private onChange = () => { }, private maxSize = 5) { }
  private _selectionDict: { [key: string]: number } = {};
  private _list: string[] = [];

  get list() {
    return this._list;
  }
  set list(list: string[]) {
    this._list = list;
    this._selectionDict = {};
    for (const [index, key] of list.entries()) {
      this._selectionDict[key] = index;
    }
  }

  isSelected(key: string) {
    return this._selectionDict[key] !== undefined;
  }

  notFirst(key: string) {
    return this._selectionDict[key] > 0; // False on undefined!
  }

  notLast(key: string) {
    // False on undefined!
    return this._selectionDict[key] < this._list.length - 1;
  }

  moveUp(key: string) {
    const idx = this._selectionDict[key];
    if (idx > 0) {
      const other = this._list[idx - 1];
      this._list[idx] = other;
      this._list[idx - 1] = key;
      this._selectionDict[key]--;
      this._selectionDict[other]++;
    }
    this.onChange();
  }

  moveDown(key: string) {
    const idx = this._selectionDict[key];
    if (idx < this._list.length - 1) {
      const other = this._list[idx + 1];
      this._list[idx] = other;
      this._list[idx + 1] = key;
      this._selectionDict[key]++;
      this._selectionDict[other]--;
    }
    this.onChange();
  }

  add(key: string) {
    while (this._list.length >= this.maxSize) {
      const dropped = this._list.pop() as string;
      delete this._selectionDict[dropped];
    }
    this._selectionDict[key] = this._list.length;
    this._list.push(key);
    this.onChange();
  }

  sortArgs(args: ArgumentMeta[]) {
    args.sort((a1, a2) => {
      return (this._selectionDict[a1.id] ?? this.maxSize) - (this._selectionDict[a2.id] ?? this.maxSize)
    });
  }
}
