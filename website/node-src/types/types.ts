import { Request } from "express";
import WebSocket from 'ws';
import { createThread } from "../internal-database/sqlite_db";
export interface RequestWithEmail extends Request {
  user_email: string
}

export type ChatMessage = {
  sender: "USER" | "ASSISTANT";
  content: string;
}

export type ChatThread = {
  thread_id: string;
  history: ChatMessage[];
  title: string | undefined;
}

export class UserSession {
  private user_id: string | undefined;
  private email: string | undefined;
  private conv_id: string | undefined;
  private history: ChatMessage[] = [];
  constructor(user_id: string, email: string) {
    this.user_id = user_id;
    this.email = email;
  }

  async addMessage(message: ChatMessage) {
    if (this.conv_id == undefined) {
      this.conv_id = await createThread(this.user_id!);
    }
    this.history.push(message);
  }

  async saveMessages() {
    if (this.conv_id == undefined)
      return;

  }
}

export interface WebSocketWithSessionInfo extends WebSocket {
  userSession: UserSession;
}
