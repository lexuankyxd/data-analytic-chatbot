from dataclasses import dataclass
from intent_classifier import classify

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
  class_of_input = classify(message)
  msg = "unknown"
  if class_of_input == "general":
    msg = "general"
  elif class_of_input == "data query":
    msg = "data query" # no reranker needed?/ decided where to find data?
  elif class_of_input == "data analysis":
    msg = "data analysis"

  session.history.append(ChatMessage(msg, False));
  return msg
