export interface BenchmarkSource {
  key?: string;
  name: string;
  type: string;
  url: `https://${string}`;
  note: string;
}

export interface BenchmarkPalette {
  bg: string;
  ink: string;
  muted: string;
  grid: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
  c6: string;
}

export interface BenchmarkComponent<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  chartLabel: string;
  family: string;
  sourceKey: string;
  source: string;
  sourceType: string;
  sourceUrl: `https://${string}`;
  visualSystem: string;
  grammar: string;
  renderer: string;
  description: string;
  useWhen: string;
  tags: string[];
  palette: BenchmarkPalette;
  dataNote: string;
  data: TData;
}

export interface BenchmarkQuery {
  query?: string;
  family?: string;
  sourceType?: string;
  source?: string;
  tags?: string[];
}

export interface BenchmarkStats {
  components: number;
  grammars: number;
  visualSystems: number;
  renderers: number;
  sources: number;
  families: number;
}

export interface BenchmarkAtlasAPI {
  readonly version: string;
  stats(): BenchmarkStats;
  list(): BenchmarkComponent[];
  get(id: string): BenchmarkComponent | null;
  query(filters?: BenchmarkQuery): BenchmarkComponent[];
  listSources(): BenchmarkSource[];
  render(idOrEntry: string | BenchmarkComponent): string;
  registerSource(key: string, source: BenchmarkSource): BenchmarkSource;
  registerRenderer(name: string, renderer: (entry: BenchmarkComponent) => string): string;
  registerComponent<TData extends Record<string, unknown>>(entry: BenchmarkComponent<TData>): BenchmarkComponent<TData>;
}

declare global {
  interface Window {
    BenchmarkAtlas: BenchmarkAtlasAPI;
  }
}

export {};
