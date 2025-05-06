import { Request } from "express";
import { WebsocketMethod } from "express-ws";

const express = require('express');
const bodyParserErrorHandler = require('express-body-parser-error-handler');
const http = require("http");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { accountRoutes } = require('./routes/account');
const websocketChat = require('./websocket_chat');
const socketClient = require('./ipc');

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(bodyParserErrorHandler());
app.use(cookieParser());
app.use(cors())
// Routes
app.use("/account", accountRoutes);

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});
