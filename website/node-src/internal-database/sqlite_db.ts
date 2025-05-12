const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database('./user_db.sqlite', (err: Error) => {
  if (err) {
    return console.error('Could not connect to database', err.message);
  }
  console.log('Connected to SQLite database.');

  // Create table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err: Error) => {
    if (err) {
      return console.error('Failed to create table', err.message);
    }
    console.log('Users table is ready.');
  });
  db.run("INSERT INTO users (username, email, password) values ()")
});

const createUser = db.prepare("INSERT INTO users values ()")
