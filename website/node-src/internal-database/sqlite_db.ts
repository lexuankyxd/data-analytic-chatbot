import { Statement } from "sqlite3";
import { RunResult, sqlite3 } from "sqlite3";

const sqlite3 = require("sqlite3").verbose()
const { hashPassword, comparePasswords } = require('../utilities/hasher');
const { logMessage } = require('../utilities/logger');

let createAccountStmt: Statement | undefined = undefined;
let loginStmt: Statement | undefined = undefined;
let createThreadStmt: Statement | undefined = undefined;
let getAllThreadsStmt: Statement | undefined = undefined;
let deleteThreadStmt: Statement | undefined = undefined;
let setThreadTitleStmt: Statement | undefined = undefined;
let setThreadTimestampStmt: Statement | undefined = undefined;

const db = new sqlite3.Database('./user_db.sqlite', (err: Error) => {
  if (err) {
    return console.error('Could not connect to database', err.message);
  }
  logMessage("INF", 'Connected to SQLite database.');

  // Create table if it doesn't exist
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`, (err: Error) => {
      if (err) {
        return logMessage('ERR', "Failed to create table" + err.message);
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title VARCHAR(50),
      timestamp TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err: Error) => {
      if (err) {
        return logMessage('ERR', "Failed to create table" + err.message);
      }
    });

    createAccountStmt = db.prepare("INSERT INTO users (username, email, password_hash) values (?, ?, ?)");
    loginStmt = db.prepare("select * from users where email = ?;");
    createThreadStmt = db.prepare("INSERT INTO threads (user_id, title, timestamp) values (?, ?, CURRENT_TIMESTAMP)");
    getAllThreadsStmt = db.prepare("SELECT * FROM threads WHERE user_id = ?");
    deleteThreadStmt = db.prepare("DELETE FROM threads WHERE id = ?");
    setThreadTitleStmt = db.prepare("UPDATE threads SET title = ? WHERE id = ?");
    setThreadTimestampStmt = db.prepare("UPDATE threads SET timestamp = CURRENT_TIMESTAMP where id = ?");
  })
});


export async function createAccount(username: string, email: string, password: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(password);
    const res = createAccountStmt!.run(username, email, hashedPassword);
    logMessage("INF", `New user with email ${email} created.`)
    return true;
  } catch (err) {
    logMessage("ERR", err);
    return false;
  }
}

export function login(email: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    loginStmt!.get(email, async (err: any, row: any) => {
      if (err) {
        logMessage("ERR", err);
        return resolve("ERR");
      }
      if (!row) {
        logMessage("INF", `No account found or incorrect password for email ${email}`);
        return resolve("FAI");
      }
      const match = await comparePasswords(password, row.password_hash);
      if (!match) {
        logMessage("INF", `No account found or incorrect password for email ${email}`);
        return resolve("FAI");
      }
      logMessage("INF", `User ${email} logged in successfully`);
      return resolve(row.id);
    });
  });
}

export async function createThread(user_id: string, title: string): Promise<string> {
  return new Promise((resolve, reject) => {
    createThreadStmt!.run(user_id, title, function (this: RunResult, err: Error) {
      if (err) {
        reject(err.message);
      }
      // this.lastID contains the auto increment ID of the inserted row
      resolve(this.lastID.toString());
    });
  })
}

export async function setThreadTitle(thread_id: string, title: string) {
  setThreadTitleStmt!.run(title, thread_id, function (this: RunResult, err: Error) {
    if (err) {
      logMessage("ERR", "Failed updating title " + err);
    }
  })
}

export async function getAllThread(user_id: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    getAllThreadsStmt!.all(user_id, (err: Error | null, rows: any[]) => {
      if (err) {
        return reject(err.message);
      }
      // Assuming you want to return an array of some string property from each row,
      // for example, the 'file' column:
      const results: string[] = rows;
      resolve(results);
    });
  });
}

export async function deleteThread(thread_id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    deleteThreadStmt!.run(thread_id, function (this: RunResult, err: Error | null) {
      if (err) {
        console.error("Error deleting conversation:", err);
        reject(err);
        return;
      }
      // 'this.changes' indicates how many rows were affected
      if (this.changes === 0) {
        // No conversation deleted: either conv_id or user_id didn't match
        resolve(false);
      } else {
        // Successfully deleted
        resolve(true);
      }
    });
  });
}

export async function setThreadTimestamp(thread_id: string) {
  setThreadTimestampStmt!.run(thread_id, function (this: RunResult, err: Error) {
    if (err) {
      logMessage("ERR", "Failed updating timestamp " + err);
    }
  })
}
