// src/utils/logger.ts
import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const LOG_FILE = process.env.MCP_LOG_FILE === "false"
  ? null
  : path.join(homedir(), ".mcp-think-tank", "logs", "mcp-think-tank.log");
const MAX = 10 * 1024 * 1024;        // 10 MB cap
const LEVEL = process.env.MCP_DEBUG === "true" ? "debug" : "info";

function write(level: string, msg: string, data?: unknown) {
  if (["debug","trace"].includes(level) && LEVEL !== "debug") return;

  const line = `[${new Date().toISOString()}] [${level}] ${msg}` +
               (data ? ` ${JSON.stringify(data)}` : "");
  // 1) stderr for FastMCP / CLI
  console.error(line);

  // 2) optional rolling file
  if (LOG_FILE) {
    const dir = path.dirname(LOG_FILE);
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX) {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.${Date.now()}.old`);
    }
    fs.appendFileSync(LOG_FILE, line + "\n");
  }
}

export const logger = {
  debug: write.bind(null, "debug"),
  info : write.bind(null, "info"),
  warn : write.bind(null, "warn"),
  error: write.bind(null, "error"),
};
