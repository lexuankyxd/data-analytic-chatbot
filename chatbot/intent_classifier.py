import re
from dotenv import load_dotenv
import json
import os
import pandas as pd
import requests
from openai import OpenAI


load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=OPENROUTER_API_KEY)
model = "meta-llama/llama-4-maverick:free"
SUPPORTED_DBMS = ["psql", "mysql", "sqlite"]
DBMS_CONFIG = json.load(open("chatbot/sample_json/sample_mysql.json"))
PROMPT = f"""You have 2 task:
  1. Answer the question based on the context and tables provided.
  2. If the answer is not in the context or tables or you can't answer the question, say "I don't know" and
  provide a SQL query to get the required data, ensure your sql is valid and effiencient, and always in a sql code block.
  This is the database schematics: {json.dumps(json.load(open("chatbot/db_des.json")))}
"""
# client = OpenAI(
#   api_key = os.getenv("OPENROUTER_API_KEY"),
#   base_url = "https://openrouter.ai/api/v1",
# )

dbms_name = DBMS_CONFIG["dbms"]
db_cred = DBMS_CONFIG["creds"]
db = None
if dbms_name == "mysql":
  import mysql.connector
  db = mysql.connector.connect(**db_cred)
cursor = db.cursor()
# chat = client.chats.create(model="gemini-2.5-pro-exp-03-25")
conv_history=[
  {"role": "system",
    "content":  PROMPT,},
]
def ask(ques, context = None, tables = None):
  # print(conv_history[0]['content'])
  try:
    tmp = {"role": "user", "content": f"Question: {ques}"}
    if(tables != None or len(tables) != 0):
      tmp["content"] += f"\nTables: {tables}"
    if(context != None):
      tmp["content"] += f"\nContext: {context}"
    conv_history.append(tmp)
    # print(tmp)
    response = client.chat.completions.create(
      model=model,
      messages=conv_history)
    # print(response)
    conv_history.append({"role": "assistant", "content": response.choices[0].message.content})
    return response.choices[0].message.content
  except Exception as e:

    print(f"Error: {e}")
    return "Không truy xuất được dữ liệu"
  # response = chat.send_message_stream(ques)
  # ans = ""
  # for chunk in response:
  #   if chunk.text:
  #     ans += chunk.text
  #   # print(chunk.text, end="")
  # return ans

def parse_codeblock(inp):
  pattern = r'```.*?```'
  # print(ans)
  # Extract SQL code using regular expression
  sql_code = re.search(pattern, inp, re.DOTALL)
  #print(sql_code)
  if sql_code:
    # Remove leading and trailing whitespace
    sql_code = sql_code.group().strip()[6:-3]
    print(sql_code)
  else:
    print("No SQL code found.")
  return sql_code

def query_db(query):
    try:
        cursor.execute(query)
        df = pd.DataFrame(cursor.fetchall(), columns=[desc[0] for desc in cursor.description])
        return df.to_html(classes='table table-striped', index=False, border=0)
    except Exception as e:
        print("[query_db ERROR]:", e)
        return f"[QUERY ERROR]: {e}"



def send_first_message():
    #   cursor.execute(input())
    #   print(cursor.fetchall())

  response = ask(
    f"Your job is to generate SQL queries to aids the user with their questions about data from a\
    database with this description: \n{json.dumps(json.load(open("chatbot/db_des.json", 'r')), indent=4)}. Keep\
    your solution SQL query inside a SQL codeblock for easy extraction.",
  )

  # for chunk in response:
  #   print(chunk.text, end="")
  #   print('\n')
  # while 1:

  #   res = ask(input("Your question"))
  #   print(res)
  #   query = parse_sql(res)
  #   df = None
  #   if query:
  #     df = query_db(query)
  #   else:
  #     print("NO DB FOUND, WRONG DB CONFIG")
  #   if df:
  #     print(df.to_string())
