const router = require('express').Router();
import { Request, Response } from "express";
import { createAccount, login } from "../internal-database/database";
import { logMessage } from "../utilities/logger";
const auth = require('../middleware/auth');
import { generateToken, verifyToken } from "../middleware/auth";

router.post('/login', async (req: Request, res: Response) => {
  try {
    if (!("email" in req.body) || !("password" in req.body))
      return res.json({ "message": "Missing field." });
    const result = await login(req.body.email, req.body.password);
    if (result == "FAI") return res.json({ "message": "Login unsuccessful" });
    if (result == "ERR") return res.json({ "message": "Server internal error" })
    else {
      return res.json({ "access_token": generateToken(`${result} ${req.body.email}`) });
    }
  } catch (err) {
    logMessage("ERR", err as string);
    return res.json({ "message": "Server internal error" })
  }
});

router.post('/register', async (req: Request, res: Response) => {
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

module.exports = router;
