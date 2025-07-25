import PubNub from 'pubnub';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LogRow, AnalysisResult, SummaryCount } from '../types';

dayjs.extend(utc);

export class PubNubAnalyzer {
  private pubnub: PubNub;

  constructor(subscribeKey: string) {
    this.pubnub = new PubNub({
      subscribeKey,
      userId: 'why403-web-debugger'
    });
  }

  analyzeLogRow(row: LogRow): AnalysisResult {
    try {
      const logTs = dayjs.utc(row.log_ts);
      const uuid = row.uuid;
      const authToken = row.authToken;
      const api = (row.api || '').toLowerCase();

      const token = this.pubnub.parseToken(authToken);
      if (!token) {
        throw new Error('Token parsing failed');
      }

      const ttl = token.ttl || 0;
      const timestamp = token.timestamp || 0;
      const tokenUuid = token.authorized_uuid || '';
      const issuedAt = dayjs.unix(timestamp).utc();
      const expiresAt = issuedAt.add(ttl, 'minute');

      const requestedChannels = (row.channels || '')
        .split(',')
        .map((ch) => ch.trim())
        .filter((ch) => ch.length > 0);

      const requestedGroups = (row.channel_groups || '')
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const channels = token.resources?.channels || {};
      const groups = token.resources?.groups || {};

      let rootCause = 'Unknown';

      const apiRules: Record<string, { channels?: string; groups?: string }> = {
        subscribe: { channels: 'read', groups: 'read' },
        publish: { channels: 'write' },
        history: { channels: 'read' },
        presence: { channels: 'read' }
      };

      if (!issuedAt.isValid() || !expiresAt.isValid()) {
        rootCause = '🧨 Token parse error';
      } else if (logTs.isAfter(expiresAt)) {
        rootCause = '⏰ Token expired';
      } else if (tokenUuid && tokenUuid !== uuid) {
        rootCause = '🙅 UUID mismatch';
      } else {
        const rule = apiRules[api];

        if (!rule) {
          rootCause = `❓ Unsupported API: ${api}`;
        } else {
          let permissionMissing = false;

          if (rule.channels && requestedChannels.length > 0) {
            permissionMissing = requestedChannels.some((ch) => {
              const perms = channels[ch] as any;
              return !perms || perms[rule.channels!] !== true;
            });
            if (permissionMissing) {
              rootCause = `📡 Missing ${rule.channels.toUpperCase()} permission on channel`;
            }
          }

          if (!permissionMissing && rule.groups && requestedGroups.length > 0) {
            permissionMissing = requestedGroups.some((grp) => {
              const perms = groups[grp] as any;
              return !perms || perms[rule.groups!] !== true;
            });
            if (permissionMissing) {
              rootCause = `🧺 Missing ${rule.groups.toUpperCase()} permission on group`;
            }
          }

          if (!permissionMissing) {
            rootCause = '✅ Token appears valid – investigate infrastructure';
          }
        }
      }

      return {
        logRow: { ...row, rootCause },
        tokenDetails: {
          ttl,
          timestamp,
          authorized_uuid: tokenUuid,
          issuedAt: issuedAt.format(),
          expiresAt: expiresAt.format(),
          channels,
          groups
        },
        rootCause
      };
    } catch (err) {
      const rootCause = '🧨 Token parse error';
      return {
        logRow: { ...row, rootCause },
        tokenDetails: {
          ttl: 0,
          timestamp: 0,
          authorized_uuid: '',
          issuedAt: '',
          expiresAt: '',
          channels: {},
          groups: {}
        },
        rootCause
      };
    }
  }

  analyzeLogRows(rows: LogRow[]): {
    results: AnalysisResult[];
    summary: SummaryCount;
  } {
    const results: AnalysisResult[] = [];
    const summary: SummaryCount = {};

    rows.forEach((row) => {
      const result = this.analyzeLogRow(row);
      results.push(result);
      summary[result.rootCause] = (summary[result.rootCause] || 0) + 1;
    });

    return { results, summary };
  }
}