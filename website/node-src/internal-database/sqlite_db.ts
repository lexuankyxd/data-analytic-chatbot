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
        return console.error('Failed to create table', err.message);
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS user_chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      file text,
      foreign key (user_id) references users(id)
    )`, (err: Error) => {
      if (err) {
        return console.error('Failed to create table', err.message);
      }
    });
  })
});

const createUser = db.prepare("INSERT INTO users (username, email, password_hash) values (?, ?, ?)");
const lookUpUserWithEmail = db.prepare("select * from users where email = ?;");

export async function createAccount(username: string, email: string, password: string): Promise<string> {
  try {
    const hashedPassword = await hashPassword(password);
    const res = createUser.run(username, email, hashedPassword);
    console.log(res);
    return "SUC";
  } catch (err) {
    logMessage("ERR", err);
    return "ERR";
  }
}

export async function login(email: string, password: string): Promise<string> {
  try {
    lookUpUserWithEmail.get(email, async (err: any, row: any) => {
      if (row == undefined) {
        logMessage("INF", `No account found for email ${email}`);
        return "FAI";
      }
      const match = await comparePasswords(password, row.password_hash)
      if (!match) {
        logMessage("INF", `Incorrect password for email ${email}`);
        return 'FAI';
      }
      logMessage("INF", `User ${email} logged in successfully`);
      return "SUC";
    });
    return "SUC"
  } catch (err) {
    logMessage("ERR", err)
    return "ERR";
  }
}
