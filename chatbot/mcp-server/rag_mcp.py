import threading
from fastmcp import FastMCP
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb.utils.embedding_functions as embedding_functions
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from openai import AsyncOpenAI
import json
from typing import Annotated
from dotenv import load_dotenv
import os
import queue
import socket
import asyncio
from socketHandler import AllOSSocket
from pydantic import Field
load_dotenv()

work_queue = queue.Queue()
rag_mcp = FastMCP("RAG")
# rag_api = FastAPI()
# client = chromadb.PersistentClient("/home/g0dz/projects/da-llm/chatbot/mcp-server/vstore")
client = chromadb.EphemeralClient()

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
  api_key=os.getenv("ALIBABA_API_KEY"),
  api_base=os.getenv("BASE_API_URL"),
  model_name="text-embedding-v3"
)

asyncClient = AsyncOpenAI(
  api_key=os.getenv("ALIBABA_API_KEY"),
  base_url=os.getenv("BASE_API_URL"),
)

collection = client.get_or_create_collection("main", embedding_function=openai_ef)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def loadIntoVectorStoreThread():
  sock = AllOSSocket("/home/g0dz/projects/da-llm/socket/progress.sock")
  data_buffer = ''
  lock = asyncio.Lock()


  async def process_chunks(document, chunks):
    nonlocal lock
    prev_progress = 0
    total_chunks = len(chunks)
    progress_counter = 0

    async def process_single_chunk(i, chunk):
      nonlocal progress_counter, prev_progress
      emb = await asyncClient.embeddings.create(
        model= "text-embedding-v3",
        input= chunk.page_content,
      )
      emb = json.loads(emb.model_dump_json())
      collection.upsert(
        documents=[chunk.page_content],
        ids=[f"id_{i}"],
        metadatas=[chunk.metadata],
        embeddings=emb["data"][0]["embedding"]
      )
      progress_counter += 1
      progress = progress_counter / total_chunks * 100
      if progress >= prev_progress + 5:
        prev_progress = progress
        print(f"{document} {progress}")
        sock.sendMessage(json.dumps({"file": document, "progress": progress}))

    # Run all chunk uploads concurrently
    await asyncio.gather(*[process_single_chunk(i, chunk) for i, chunk in enumerate(chunks)])

    sock.sendMessage(json.dumps({"file": document, "progress": 100}))
    os.remove(document)

  async def worker(queue):
    while True:
      document = await queue.get()
      loader = PyMuPDFLoader(document)
      raw_docs = loader.load()
      chunks = text_splitter.split_documents(raw_docs)
      await process_chunks(document, chunks)
      queue.task_done()

  async def producer(queue):
    nonlocal data_buffer
    while True:
      data = await asyncio.to_thread(sock.fetchData, 1024)
      if data is None:
        continue
      data_buffer += data
      while '\n' in data_buffer:
        document, data_buffer = data_buffer.split('\n', 1)
        if not document.strip():
          continue
        _, ext = os.path.splitext(document)
        if ext != ".pdf":
          continue
        await queue.put(document)
  async def main_loop():
    tasks = asyncio.Queue()  # Keep track of running tasks to avoid garbage collection
    workers = [asyncio.create_task(worker(tasks)) for _ in range(10)]
    await asyncio.gather(producer(tasks), *workers)
  asyncio.run(main_loop())

t1 = threading.Thread(target=loadIntoVectorStoreThread)
t1.daemon = True
t1.start()


@rag_mcp.tool()
def query(
  query: Annotated[str, Field(description="Query to gather relavent context from uploaded files.")]
) -> list:
  """Queries the vector store for relevant context."""
  try:
    res = collection.query(query_texts=[query], n_results=3)
    assert res is not None
    assert res["documents"] is not None
    assert res["metadatas"] is not None
    if len(res["documents"]) == 0:
      return [{"message": "No context found"}]
    return [{"data": res["documents"][0][i], "metadata": res["metadatas"][0][i]} for i in range(3)]
  except:
    return [{"message": "error occured"}]
