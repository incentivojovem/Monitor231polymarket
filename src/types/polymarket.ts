export interface CandidateMarket {
  id: string;
  conditionId: string;
  question: string;
  candidate: string;
  slug: string;
  yesPrice: number;
  percentage: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  image?: string;
  icon?: string;
  yesTokenId: string | null;
  noTokenId: string | null;
  lastPrice?: number;
  change24h?: number;
  change7d?: number;
}

export interface ElectionEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  icon?: string;
  volume: number;
  volume24hr?: number;
  volume1wk?: number;
  volume1mo?: number;
  liquidity: number;
  openInterest: number;
  active: boolean;
  closed: boolean;
  updatedAt: string;
}

export interface ElectionData {
  source: 'live' | 'cache' | 'stale_cache';
  event: ElectionEvent;
  markets: CandidateMarket[];
  timestamp: number;
}

export interface HistoryPoint {
  t: number; // unix timestamp in seconds
  p: number; // price between 0.0 and 1.0 (probability)
}

export interface CandidateHistory {
  market: string;
  interval: string;
  fidelity: string;
  history: HistoryPoint[];
  timestamp: number;
}

export interface RelatedEvent {
  id: string;
  title: string;
  slug: string;
  volume: number;
  liquidity: number;
  image?: string;
  active: boolean;
  closed: boolean;
  endDate: string;
  marketsCount: number;
}

export type Timeframe = '24h' | '7d' | '30d' | 'all';

export type OfficeType = 'president' | 'governor';

export interface GovernorState {
  uf: string;
  name: string;
  slug: string;
  region: string;
  title: string;
}
