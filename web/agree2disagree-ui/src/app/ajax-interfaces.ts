export interface ClaimMeta {
  id: string;
  textId: string;
}
export interface ArgumentMeta {
  id: string;
  textId: string;
  isAgainst: boolean;
}

export interface CounterMeta {
  id: string;
  textId: string;
  editable: boolean;
}

export interface AnnotationMeta {
  id: string;
  claimId: string;
  claimText: string;
  negated: boolean;
  startInText: number;
  endInText: number;
}

export interface AnoTextMeta {
  id: string;
  text: string;
  author: string;
  annotations: AnnotationMeta[];
}

export interface ClaimBrief {
  id: string;
  text: string;
}

export type CounterDict = { [key: string]: string };

export interface Opinion {
  value?: number;
  selectedArgumentsFor: string[];
  selectedArgumentsAgainst: string[];
  selectedCounters: CounterDict;
}
