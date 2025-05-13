export const accountRoutes = require('express').Router();
import { Request, Response } from "express";
import { createAccount, login } from "../internal-database/sqlite_db";
import { logMessage } from "../utilities/logger";
import { hashGeneral } from "../utilities/hasher";
const auth = require('../middleware/auth');
import { generateToken, refreshAccessToken, verifyAccessToken } from "../middleware/auth";


accountRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    if (!("email" in req.body) || !("password" in req.body))
      return res.json({ "message": "Missing field." });
    const result = await login(req.body.email, req.body.password);
    if (result == "FAI") return res.json({ "message": "Login unsuccessful" });
    if (result == "ERR") return res.json({ "message": "Server internal error" })
    else {
      const [access_token, refresh_token] = generateToken(req.body.email);
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,      // only send cookie over HTTPS
        sameSite: 'none',
        maxAge: 12 * 60 * 60 * 1000, // 12h
        path: "/"
      });
      return res.json({ "access_token": access_token });
    }
  } catch (err) {
    logMessage("ERR", err as string);
    return res.json({ "message": "Server internal error" })
  }
});

accountRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    if (!("email" in req.body) || !("password" in req.body) || !("username" in req.body))
      return res.json({ "message": "Missing field." });
    const result = await createAccount(req.body.username, req.body.email, req.body.password);
    if (result == "ERR") return res.json({ "error": "Registration error." });
    else {
      return res.json({ "message": "Account registered" });
    }
  } catch (err) {
    logMessage("ERR", err as string);
    return res.json({ "error": "Internal server error." });
  }
});

accountRoutes.post('/refresh', (req: Request, res: Response) => {
  var token = req.cookies.refresh_token;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }
  token = refreshAccessToken(token);
  if (token == "INVALID TOKEN") return res.json({ "message": "Invalid token" });
  return res.json({ "access_token": token });
})

accountRoutes.post("/validate", (req: Request, res: Response) => {
  try {
    if (!("access_token" in req.body))
      return res.json({ "message": "Missing field." });
    const r = verifyAccessToken(req.body.access_token);
    if (r == "INVALID TOKEN") return res.json({ "message": "Invalid token" });
    return res.json({ "message": "Token valid" });
  } catch (err) {
    logMessage("ERR", err as string);
    return res.json({ "message": "Server internal error" })
  }
})

accountRoutes.get("/logout", (req: Request, res: Response) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 12 * 60 * 60 * 1000, // 12h
    path: "/"
  });
  res.status(200).json({ message: 'Logged out' });
})
