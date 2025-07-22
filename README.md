# Why403 Analyzer

A CLI tool to analyze PubNub 403 Subscribe API failures with deep insights into token scope mismatches, expired credentials, and missing read permissions.

## Features

- 🔐 Parses and inspects PubNub access tokens
- 📡 Checks channel and channel group read permissions
- ⏰ Detects token expiration and TTL window violations
- 🙅 Identifies UUID mismatches between token and request
- 📊 Outputs aligned summary with emoji-tagged root causes
- 🐞 Optional `--debug` mode for full token and request trace

## Installation

```bash
git clone git@github.com:PubNubDevelopers/why403s.git
cd why403s
npm install

## Usage

```bash
node why403.js --subkey YOUR_SUB_KEY [--file input.csv] [--debug]

