# Why403s Log Lines Analyzer

A CLI tool to analyze PubNub 403 Subscribe API failures with deep insights into token scope mismatches, expired credentials, and missing channel and channel group permissions.

## Features

- 🔐 Parses and inspects PubNub Access Manager v3 auth tokens
- 📡 Checks channel and channel group permissions
- ⏰ Detects token expiration and TTL window violations
- 🙅 Identifies UUID mismatches between authorized uuid in token and the uuid from the request request
- 📑 Outputs 403 root cause reason per log line in a separate file
- 📊 Outputs aligned summary with emoji-tagged root causes to the console
- 🐞 Optional `--debug` mode for full token and request trace

## Installation

```bash
git clone git@github.com:PubNubDevelopers/why403s.git
cd why403s
npm install
```

## Usage

### Inputs
1. subkey that was used to get server logs
2. the server log file using the following minimal queries (per API)

The `api` column must be included to indicate which permission needs to be checked. Currently works for the following PubNub APIs:
- publish
- subscribe
- presence
- history

```sql
-- subscribe
select api, log_ts, ts, channels, 
  coalesce(try(query_params['channel-group']), '') as channel_groups,  
  coalesce(try(query_params['uuid']), '') as uuid, 
  coalesce(try(query_params['auth']), '') as authToken
from phonebooth_hourly.v_subscribe
WHERE yyyy = '2025' and mm = '07' and dd = '12' -- and hh = '15'
  and sub_key = 'sub-c-redacted'
  and sur = 1

-- publish
select api, log_ts, ts, channels, 
  coalesce(try(query_params['channel-group']), '') as channel_groups,  
  coalesce(try(query_params['uuid']), '') as uuid, 
  coalesce(try(query_params['auth']), '') as authToken
from phonebooth_hourly.v_subscribe
WHERE yyyy = '2025' and mm = '07' and dd = '12' -- and hh = '15'
  and sub_key = 'sub-c-redacted'
  and pur = 1
```

```bash
node why403.js --subkey YOUR_SUB_KEY [--file input.csv] [--debug]
```
_default log lines input file is "logs.csv"_

