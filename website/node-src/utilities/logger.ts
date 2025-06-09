const dotenv = require('dotenv');
import { appendFile } from 'fs/promises';
const fs = require('fs');

dotenv.config();


const LOG_MODES = ["CONSOLE", "FILE", "CONSOLE+FILE"]
type LOG_MODE = "CONSOLE" | "FILE" | "CONSOLE+FILE";
var log_mode: LOG_MODE = "CONSOLE+FILE";
const LOG_FILE = process.env.LOG_FILE || './APP_LOG.log';

/*
 * Returns a formated message
 */

function messageConsoleFormat(code: string, message: string): string {
  return `[${getCurrentDateTime()}][${code}] ${message}`;
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function messageFileSyslogFormat(code: string, message: string): string {
  return `${getCurrentDateTime()} linux-ky webserver[${process.pid}]: ${code} ${message}`
}

/*
 * Sets the log mode
 * @param mode - The log mode to set
 */

export function setLogMode(mode: string): void {
  if (mode in LOG_MODES) {
    log_mode = mode as LOG_MODE;
  }
}

async function file_log(code: string, message: string): Promise<void> {
  try {
    await appendFile(LOG_FILE, messageConsoleFormat(code, message) + '\n');
  } catch (err) {
    throw err;
  }
}

async function console_file_log(code: string, message: string): Promise<void> {
  console.log(messageConsoleFormat(code, message));
  try {
    await appendFile(LOG_FILE, messageFileSyslogFormat(code, message) + '\n');
  } catch (err) {
    throw err;
  }
}

/*
 * Logs a message to the console or file based on set mode
 * @param code - The log code
 * @param message - The log message
 */

export async function logMessage(code: string, message: string): Promise<void> {
  if (log_mode == "CONSOLE") {
    console.log(messageConsoleFormat(code, message));
  } else if (log_mode == "FILE") {
    await file_log(code, message);
  } else if (log_mode == "CONSOLE+FILE") {
    await console_file_log(code, message);
  }
}
