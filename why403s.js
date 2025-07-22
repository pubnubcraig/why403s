const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const stringWidth = require("string-width");
dayjs.extend(utc);

const PubNubModule = require("pubnub");
const PubNub = PubNubModule.default || PubNubModule;

// CLI ARGUMENTS
const args = process.argv.slice(2);
let subscribeKey = null;
let inputFile = "logs.csv";
let debug = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === "--subkey" || arg === "-s") && args[i + 1]) {
    subscribeKey = args[i + 1];
    i++;
  } else if ((arg === "--file" || arg === "-f") && args[i + 1]) {
    inputFile = args[i + 1];
    i++;
  } else if (arg === "--debug") {
    debug = true;
  }
}

if (!subscribeKey) {
  console.error("❌ Error: Subscribe key is required.");
  console.log("Usage: node why403.js --subkey <subscribe_key> [--file <csv_filename>] [--debug]");
  process.exit(1);
}

const inputPath = path.resolve(__dirname, inputFile);
const outputPath = path.resolve(__dirname, "403_analysis_results.csv");

const pubnub = new PubNub({
  subscribeKey,
  userId: "why403-debugger"
});

const results = [];
const summaryCounts = {};

fs.createReadStream(inputPath)
  .pipe(csv())
  .on("data", (row) => {
    try {
      const logTs = dayjs.utc(row.log_ts);
      const uuid = row.uuid;
      const authToken = row.authToken;

      const token = pubnub.parseToken(authToken);
      const ttl = token.ttl;
      const timestamp = token.timestamp;
      const tokenUuid = token.authorized_uuid;
      const issuedAt = dayjs.unix(timestamp).utc();
      const expiresAt = issuedAt.add(ttl, "minute");

      const requestedChannels = (row.channels || "")
        .split(",")
        .map((ch) => ch.trim())
        .filter((ch) => ch.length > 0);

      const requestedGroups = (row.channel_groups || "")
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const channels = token.resources?.channels || {};
      const groups = token.resources?.groups || {};

      let rootCause = "Unknown";

      if (!issuedAt.isValid() || !expiresAt.isValid()) {
        rootCause = "🧨 Token parse error";
      } else if (logTs.isAfter(expiresAt)) {
        rootCause = "⏰ Token expired";
      } else if (tokenUuid && tokenUuid !== uuid) {
        rootCause = "🙅 UUID mismatch";
      } else {
        const missingChannel = requestedChannels.find((ch) => {
          if (!channels.hasOwnProperty(ch)) return true;
          if (channels[ch].read !== true) return true;
          return false;
        });

        if (missingChannel) {
          rootCause = "📡 Missing READ permission on channel";
        } else {
          const missingGroup = requestedGroups.find((grp) => {
            if (!groups.hasOwnProperty(grp)) return true;
            if (groups[grp].read !== true) return true;
            return false;
          });

          if (missingGroup) {
            rootCause = "🧺 Missing READ permission on group";
          } else {
            rootCause = "✅ Token appears valid – investigate infrastructure";
          }
        }
      }

      summaryCounts[rootCause] = (summaryCounts[rootCause] || 0) + 1;
      results.push({ ...row, rootCause });

      if (debug) {
        console.log("----------------------------------------------------");
        console.log(`📅 log_ts: ${logTs.format()}`);
        console.log(`📅 token issuedAt: ${issuedAt.isValid() ? issuedAt.format() : "Invalid"}`);
        console.log(`📅 token expiresAt: ${expiresAt.isValid() ? expiresAt.format() : "Invalid"}`);
        console.log(`🔐 request UUID: ${uuid}`);
        console.log(`🔐 token   UUID: ${tokenUuid}`);
        console.log("📦 requested channels:", requestedChannels);
        console.log("📦 token channel perms:", JSON.stringify(channels, null, 2));
        console.log("📦 requested groups:", requestedGroups);
        console.log("📦 token group perms:", JSON.stringify(groups, null, 2));
        console.log(`🛠 root cause: ${rootCause}`);
      }
    } catch (err) {
      const rootCause = "🧨 Token parse error";
      summaryCounts[rootCause] = (summaryCounts[rootCause] || 0) + 1;
      results.push({ ...row, rootCause });
      if (debug) console.log("❌ Token parse error:", err.message);
    }
  })
  .on("end", () => {
    const output = fs.createWriteStream(outputPath);
    const headers = Object.keys(results[0]).join(",") + "\n";
    output.write(headers);
    for (const row of results) {
      const line = Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",") + "\n";
      output.write(line);
    }
    output.end();

    console.log(`\n✅ Analysis complete. Output saved to ${outputPath}`);

    console.log(); // spacing

    const totalIssues = Object.values(summaryCounts).reduce((sum, c) => sum + c, 0);
    const maxReasonLength = Math.max(...Object.keys(summaryCounts).map(r => stringWidth(r)));
    const maxCountLength = Math.max(...Object.values(summaryCounts).map(c => String(c).length));

    const indent = "   ";
    const header = "📊 Root Cause Summary:";
    const paddedHeader = header.padEnd(maxReasonLength, " "); // ✅ No +indent.length
    const paddedTotal = String(totalIssues).padStart(maxCountLength, " ");
    console.log(`${indent}${paddedHeader} : ${paddedTotal}`);

    Object.entries(summaryCounts).forEach(([reason, count]) => {
      const reasonWidth = stringWidth(reason);
      const padding = " ".repeat(maxReasonLength - reasonWidth);
      const paddedReason = reason + padding;
      const paddedCount = String(count).padStart(maxCountLength, " ");
      console.log(`${indent}${paddedReason} : ${paddedCount}`);
    });

  });