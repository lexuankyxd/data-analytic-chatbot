import re
from google import genai
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
SUPPORTED_DBMS = ["psql", "mysql", "sqlite"]
DBMS_CONFIG = json.load(open("chatbot/sample_json/sample_mysql.json"))

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
  {"role": "system", "content": f"Your job is to generate SQL queries to aids the user with their questions about data from a\
      database with this description: \n{json.dumps(json.load(open("chatbot/db_des.json", 'r')), indent=4)}. Keep\
      your solution SQL query inside a SQL codeblock for easy extraction.",},
]


def ask(ques):
  # print(conv_history[0]['content'])
  try:
    conv_history.append({"role": "user", "content": ques})
    response = client.chat.completions.create(
      model="openrouter/quasar-alpha",
      messages=conv_history)
    # print('x', response)
    conv_history.append({"role": "assitant", "content": response.choices[0].message.content})
    # print(conv_history)
    return response.choices[0].message.content
  except Exception as e:

    # print(f"Error: {e}")
    return "```sql select * from employees limit 100;```"
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
  if db == None:
    return None
  cursor.execute(query)

  fields = [field_md[0] for field_md in cursor.description]
  result = [row for row in cursor.fetchall()]

  # print(len(result))
  df = pd.DataFrame(result)
  # print(df.to_string())
  print(df.columns)
  for i in range(len(fields)):
    df.rename(columns={f'{i}' : fields[i]})
  return df

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
