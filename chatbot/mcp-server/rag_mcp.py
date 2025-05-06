from fastmcp import FastMCP
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb.utils.embedding_functions as embedding_functions
import chromadb
import json
from fastapi import FastAPI
from typing import Annotated
from dotenv import load_dotenv
import os

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

## turns this into rest API call?
# @rag_api.post("/load_file")
def loadIntoVectorStore(
  document: Annotated[str, Field(description="Path to the document that will be loaded into the vector store.")]
) -> None:
  """Loads a document into the vector store."""
  loader = PyMuPDFLoader(document)
  raw_docs = loader.load()
  chunks = text_splitter.split_documents(raw_docs)

  i = 0
  for chunk in chunks:
    collection.upsert(documents = [chunk.page_content], ids = [f"id_{i}"], metadatas = [chunk.metadata], embeddings = openai_ef(chunk.page_content))
    i+= 1

@rag_mcp.tool()
def query(
  query: Annotated[str, Field(description="Query to gather relavent context from uploaded files.")]
) -> dict:
  """Queries the vector store for relevant context."""
  return collection.query(query_texts=[query], n_results=5)
