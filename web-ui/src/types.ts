export interface LogRow {
  api: string;
  log_ts: string;
  ts: string;
  channels: string;
  channel_groups: string;
  uuid: string;
  authToken: string;
  rootCause?: string;
}

export interface AnalysisResult {
  logRow: LogRow;
  tokenDetails: {
    ttl: number;
    timestamp: number;
    authorized_uuid: string;
    issuedAt: string;
    expiresAt: string;
    channels: Record<string, any>;
    groups: Record<string, any>;
  };
  rootCause: string;
}

export interface SummaryCount {
  [key: string]: number;
}

export interface AnalysisSettings {
  subscribeKey: string;
  debugMode: boolean;
}