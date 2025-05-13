/*
 *  DEPRECATED
 */

const mysql = require('mysql2');
const { hashPassword, comparePasswords } = require('../utilities/hasher');
const { logMessage } = require('../utilities/logger');
const creds = {
  "host": "localhost",
  "user": "root",
  "password": "password",
  "database": "chatbotdb"
}

const connection = mysql.createConnection(creds);


/*
 * Create a new account in the database.
 * @param {string} username - The username of the new account.
 * @param {string} email - The email address of the new account.
 * @param {string} password - The password of the new account.
 * @returns {string} - "SUC" if the account was created successfully, "ERR" otherwise.
 */
export async function createAccount(username: string, email: string, password: string): Promise<string> {
  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO account (username, email, pwhash) VALUES (?, ?, ?)';
    const values = [username, email, hashedPassword];
    await connection.promise().query(query, values);
    logMessage("INF", `Account ${email} created successfully`);
    return "SUC";
  } catch (err) {
    logMessage("ERR", err)
    return "ERR";
  }
}

/*
 * Login to an existing account in the database.
 * @param {string} email - The email address of the account.
 * @param {string} password - The password of the account.
 * @returns {string} - "SUC" if the login was successful, "FAI" if failure and "ERR" if encountered any errors.
 */
export async function login(email: string, password: string): Promise<string> {
  try {
    const query = 'SELECT * FROM account WHERE email = ?';
    const values = [email];
    const [rows] = await connection.promise().query(query, values);
    if (rows.length === 0) {
      logMessage("INF", `No account found for email ${email}`);
      return "FAI";
    }
    const user = rows[0];
    const match = await comparePasswords(password, user.pwhash);
    if (!match) {
      logMessage("INF", `Incorrect password for email ${email}`);
      return "FAI";
    }
    logMessage("INF", `User ${email} logged in successfully`);
    return "SUC";
  } catch (err) {
    logMessage("ERR", err)
    return "ERR";
  }
}
