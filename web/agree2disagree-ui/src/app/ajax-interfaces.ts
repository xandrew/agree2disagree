export interface AnoTextMeta {
  id: string;
  text: string;
  annotations: AnnotationMeta[];
}

export interface ClaimMeta {
  id: string;
  text: AnoTextMeta;
}

export interface ArgumentMeta {
  id: string;
  text: AnoTextMeta;
  isAgainst: boolean;
  editable: boolean;
  forkHistory: string[];
}

export interface CounterMeta {
  id: string;
  text: AnoTextMeta;
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
