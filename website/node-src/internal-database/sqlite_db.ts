import { RunResult, sqlite3 } from "sqlite3";

const sqlite3 = require("sqlite3").verbose()
const { hashPassword, comparePasswords } = require('../utilities/hasher');
const { logMessage } = require('../utilities/logger');
const db = new sqlite3.Database('./user_db.sqlite', (err: Error) => {
  if (err) {
    return console.error('Could not connect to database', err.message);
  }
  console.log('Connected to SQLite database.');

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
    db.run(`CREATE TABLE IF NOT EXISTS user_chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      foreign key (user_id) references users(id)
    )`, (err: Error) => {
      if (err) {
        return logMessage('ERR', "Failed to create table" + err.message);
      }
    });
  })
});


export async function createAccount(username: string, email: string, password: string): Promise<boolean> {
  try {
    const stmt = db.prepare("INSERT INTO users (username, email, password_hash) values (?, ?, ?)");
    const hashedPassword = await hashPassword(password);
    const res = stmt.run(username, email, hashedPassword);
    stmt.finalize();
    logMessage("INF", `New user with email ${email} created.`)
    return true;
  } catch (err) {
    logMessage("ERR", err);
    return false;
  }
}

export function login(email: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("select * from users where email = ?;");
    stmt.get(email, async (err: any, row: any) => {
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
    stmt.finalize();
  });
}

export async function createThread(user_id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO user_chat (user_id, file) values (?, ?)");
    stmt.run(user_id, function (this: RunResult, err: Error) {
      if (err) {
        reject(err.message);
      }
      // this.lastID contains the auto increment ID of the inserted row
      resolve(this.lastID.toString());
    });
    stmt.finalize();
  })
}

export async function getAllThreadIds(user_id: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("SELECT * FROM user_chat WHERE user_id = ?");
    stmt.all(user_id, (err: Error | null, rows: any[]) => {
      if (err) {
        return reject(err.message);
      }
      // Assuming you want to return an array of some string property from each row,
      // for example, the 'file' column:
      const results: string[] = rows.map(row => row.id);
      resolve(results);
    });
    stmt.finalize();
  });
}

export async function deleteThread(user_id: string, conv_id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("DELETE FROM user_chat WHERE id = ? AND user_id = ?");
    stmt.run(conv_id, user_id, function (this: RunResult, err: Error | null) {
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
    stmt.finalize((err: Error) => {
      if (err) {
        console.error("Error finalizing statement:", err);
      }
    });
  });
}
