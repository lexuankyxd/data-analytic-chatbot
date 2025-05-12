import threading
from fastmcp import FastMCP
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb.utils.embedding_functions as embedding_functions
import chromadb
import json
from typing import Annotated
from dotenv import load_dotenv
import os
import socket
from pydantic import Field
load_dotenv()

rag_mcp = FastMCP("RAG")
# rag_api = FastAPI()
client = chromadb.PersistentClient("/home/g0dz/projects/da-llm/chatbot/mcp-server/vstore")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
  api_key=os.getenv("ALIBABA_API_KEY"),
  api_base=os.getenv("BASE_API_URL"),
  model_name="text-embedding-v3"
)

collection = client.get_or_create_collection("main", embedding_function=openai_ef)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def loadIntoVectorStoreThread():
  sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
  sock.connect("/home/g0dz/projects/da-llm/socket/progress.sock")
  while True:
    entries = os.listdir("/home/g0dz/projects/da-llm/files")

    # Filter only files
    files = [os.path.join("/home/g0dz/projects/da-llm/files", f) for f in entries if os.path.isfile(os.path.join("/home/g0dz/projects/da-llm/files", f))]
    for document in files:
      _, ext = os.path.splitext(document);
      if not ext == ".pdf":
        continue
      loader = PyMuPDFLoader(document)
      raw_docs = loader.load()
      chunks = text_splitter.split_documents(raw_docs)
      progress = 0
      prev_progress = 0
      i = 0
      for chunk in chunks:
        collection.upsert(documents = [chunk.page_content], ids = [f"id_{i}"], metadatas = [chunk.metadata], embeddings = openai_ef(chunk.page_content))
        i+= 1
        progress = i / len(chunks) * 100
        if progress >= prev_progress + 5:
          prev_progress = progress
          sock.sendall(json.dumps({"file": document, "progress": progress}).encode("utf-8") + b'\r\n')
      sock.sendall(json.dumps({"file": document, "progress": 100}).encode("utf-8") + b'\r\n')
      os.remove(document)

t1 = threading.Thread(target = loadIntoVectorStoreThread)
t1.daemon = True
t1.start()


@rag_mcp.tool()
def query(
  query: Annotated[str, Field(description="Query to gather relavent context from uploaded files.")]
) -> dict:
  """Queries the vector store for relevant context."""
  res = collection.query(query_texts=[query], n_results=3)
  return {"documents": res["documents"], "metadata": res["metadatas"][0]}
