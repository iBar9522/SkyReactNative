export interface InvestIdea {
  id: number;
  sort: number | null;
  date_created: string;
  date_updated: string | null;
  company: string;
  ticker: string;
  date_published: string;
  price_open: string;
  price_close: string;
  price_target: string;
  status: 'OPEN' | 'CLOSED';
  date_opened: string;
  date_closed: string | null;
  price_stoploss: string | null;
  date_target: string | null;
}

export interface InvestIdeasResponse {
  data: InvestIdea[];
}

export interface InvestIdeaCalculations {
  percentageToTarget: number;
  targetReturnPercentage: number;
  progressPercentage: number;
  currentPrice?: number;
  color: 'green' | 'red';
}
