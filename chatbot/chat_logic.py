from dataclasses import dataclass

@dataclass
class ChatMessage:
  message: str
  is_user: bool

@dataclass
class Session:
  session_id: str
  user_id: str
  history: list[ChatMessage]

def chatWithBot(session: Session, message: str):
  session.history.append(ChatMessage(message, True))
  # get message
  session.history.append(ChatMessage("hi", False));
