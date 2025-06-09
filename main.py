import asyncio
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
from openai import AsyncOpenAI
import os
import time
import random
client = chromadb.EphemeralClient()
oc = AsyncOpenAI(
  api_key="sk-88ee6d24dbb04068b0d5e5c5358584c8",
  base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

collection = client.get_or_create_collection("main")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def loadIntoVectorStoreThread():
  data_buffer = ''
  lock = asyncio.Lock()


  async def process_chunks(id, document, chunks):
    nonlocal lock
    prev_progress = 0
    total_chunks = len(chunks)
    progress_counter = 0

  async def main_loop():
    i = 0
    nonlocal data_buffer
    tasks = []  # Keep track of running tasks to avoid garbage collection
    documents = ["chatbot/mcp-server/data/bao-cao-thuong-nien-hpg-2024.pdf"]
    for document in documents:
      _, ext = os.path.splitext(document)
      if ext != ".pdf":
        continue
      loader = PyMuPDFLoader(document)
      raw_docs = loader.load()

      with open("output.txt", "w", encoding="utf-8") as f:
        for doc in raw_docs:
        # Assuming doc has attribute 'page_content' containing the text
          f.write(doc.page_content)
          f.write("\n\n")  # Separate pages with blank lines
      exit()
      chunks = text_splitter.split_documents(raw_docs)
      task = asyncio.create_task(process_chunks(i, document, chunks[:200]))
      i += 1
      tasks.append(task)
    await asyncio.gather(*tasks)
  asyncio.run(main_loop())
# t1 = threading.Thread(target=loadIntoVectorStoreThread)
# t1.daemon = True
# t1.start()

s = time.perf_counter()
loadIntoVectorStoreThread()
elapsed = time.perf_counter() - s
print(f"{__file__} executed in {elapsed:0.2f} seconds.")
