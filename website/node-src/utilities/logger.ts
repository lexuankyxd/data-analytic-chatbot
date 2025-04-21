const dotenv = require('dotenv');
import { appendFile } from 'fs/promises';
const fs = require('fs');

dotenv.config();


const LOG_MODES = ["CONSOLE", "FILE", "CONSOLE+FILE"]
type LOG_MODE = "CONSOLE" | "FILE" | "CONSOLE+FILE";
var log_mode: LOG_MODE = "CONSOLE";
const LOG_FILE = process.env.LOG_FILE || './logs.txt';

/*
 * Returns a formated message
 */

function messageFormat(code: string, message: string): string {
  return `[${new Date().toISOString()}][${code}] ${message}\n`;
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
    await appendFile(LOG_FILE, messageFormat(code, message));
  } catch (err) {
    throw err;
  }
}

async function console_file_log(code: string, message: string): Promise<void> {
  console.log(`[${code}] ${message}`);
  try {
    await appendFile(LOG_FILE, messageFormat(code, message));
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
    console.log(messageFormat(code, message));
  } else if (log_mode == "FILE") {
    await file_log(code, message);
  } else if (log_mode == "CONSOLE+FILE") {
    console.log(messageFormat(code, message));
    await console_file_log(code, message);
  }
}
