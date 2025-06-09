import { Request } from "express";
import WebSocket from 'ws';
import { createThread as crThread, deleteThread, setThreadTimestamp } from "../internal-database/sqlite_db";
import { logMessage } from "../utilities/logger";
const fs = require("fs/promises");
export interface RequestWithEmail extends Request {
  user_email: string
}

export type ChatMessage = {
  role: "user" | "assistant" | "tool" | "system";
  content?: string | null;
  tool_calls?: [{ id: string, function: { name: string, arguments: string } }];
  tool_call_id?: string;

}

export type ChatThread = {
  thread_id: string;
  history: ChatMessage[];
  types: string[];
  // uploaded: string[];
  title: string | undefined;
}

export class UserSession {
  private user_id: string;
  private email: string;
  private thread: ChatThread | undefined;
  private ws: WebSocket;
  constructor(user_id: string, email: string, ws: WebSocket) {
    this.user_id = user_id;
    this.email = email;
    this.ws = ws;
  }

  async addMessage(message: ChatMessage, type: string) {
    if (this.thread == undefined) {
      this.thread = { thread_id: await crThread(this.email!, "New thread"), history: [], types: [], title: undefined };
    }
    this.thread.history.push(message);
    this.thread.types.push(type)
  }

  getMessages() {
    return this.thread!.history
  }

  async createThread() {
    if (this.thread != undefined) {
      this.saveMessages();
    }
    this.thread = { thread_id: await crThread(this.email!, "New thread"), history: [], types: [], title: undefined };
  }

  async saveMessages() {
    if (this.thread == undefined)
      return;
    console.log(this.thread);
    if (this.thread.history.length == 0) {
      await deleteThread(this.thread.thread_id);
      return;
    }
    try {
      logMessage("INF", "SAVING THREAD");
      await setThreadTimestamp(this.thread.thread_id);
      const file_name = process.env.CHAT_HISTORY_FOLDER + "/" + this.thread.thread_id + "_" + this.email + ".json";
      await fs.writeFile(file_name, JSON.stringify(this.thread), 'utf8');
    } catch (err) {
      logMessage("ERR", err as string)
    }
  }

  async loadThread(thread_id: string): Promise<boolean> {
    if (this.thread != undefined)
      this.saveMessages()
    // this.thread = { thread_id, history, title }
    try {
      const file_name = process.env.CHAT_HISTORY_FOLDER + "/" + thread_id + "_" + this.email + ".json";
      this.thread = JSON.parse(await fs.readFile(file_name, 'utf8'));
    } catch (err) {
      logMessage("ERR", err as string)
      return false;
    }
    return true;
  }

  sendMessage(message: string) {
    this.ws.send(message);
  }

  getThread() {
    return this.thread;
  }

}
