export interface EnvDriftFileRef {
  id: string;
  name: string;
  parsedKeyCount: number;
}

export interface EnvDriftEntry {
  key: string;
  value?: string;
}

export interface EnvDriftChangedEntry {
  key: string;
  valueA?: string;
  valueB?: string;
}

export interface EnvDriftResult {
  fileA: EnvDriftFileRef;
  fileB: EnvDriftFileRef;
  onlyInA: EnvDriftEntry[];
  onlyInB: EnvDriftEntry[];
  changed: EnvDriftChangedEntry[];
  identicalCount: number;
}
