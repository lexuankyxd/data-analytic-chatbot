import { Request } from "express";
import { WebsocketMethod } from "express-ws";

const express = require('express');
const expressWs = require('express-ws');
const bodyParserErrorHandler = require('express-body-parser-error-handler');
const http = require("http");

const accountRoutes = require('./routes/account');
const socketClient = require('./ipc');
// const chat = require("./routes/chat")

const app = express();
const server = http.createServer(app);
expressWs(app, server);
app.use(express.json());
app.use(bodyParserErrorHandler());


// Routes
app.use("/account", accountRoutes);



// Websocket initialization
app.ws('/chat', (ws: any, req: Request) => {
  ws.on("message", (message: string) => {
    console.log("Received message:", message);
    ws.send("Hello from server!");
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});
