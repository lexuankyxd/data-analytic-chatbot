import { Request } from "express";
const WebSocket = require('ws');

const express = require('express');
const bodyParserErrorHandler = require('express-body-parser-error-handler');
const http = require("http");
const cookieParser = require('cookie-parser');
const cors = require('cors');
require("./spawn_mcp")
require("dotenv").config()

const { chatRoutes } = require("./routes/chat")
const { accountRoutes } = require('./routes/account');

const app = express();
const server = http.createServer(app);
const websocketChat = require('./websocket_chat');
app.use(express.json());
app.use(bodyParserErrorHandler());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // React app URL
  credentials: true,
  optionsSuccessStatus: 200
}))
// Routes
app.use("/account", accountRoutes);
app.use("/chat", chatRoutes)

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});
