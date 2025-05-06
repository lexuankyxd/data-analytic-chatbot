import mysql.connector
from fastmcp import FastMCP
from typing import Annotated
from pydantic import Field

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
)

sql_mcp = FastMCP("SQL")

# Executes the SQL
@sql_mcp.tool()
def query_db(query: Annotated[str, Field(description="The SQL query to be executed")]) -> dict:
  """Execute the query"""
  cursor = mydb.cursor()
  try:
    cursor.execute(query)
    rows = cursor.fetchall()
  # if print_to_console:
  #   # Get column names
  #   columns = [desc[0] for desc in cursor.description]

  #   # Combine column names and data for width calculation
  #   data = [columns] + list(rows)
  #   col_widths = [max(len(str(item)) for item in col) for col in zip(*data)]

  #   # Print header
  #   header = " | ".join(str(col).ljust(width) for col, width in zip(columns, col_widths))
  #   print(header)
  #   print("-" * len(header))

  #   # Print rows
  #   for row in rows:
  #       print(" | ".join(str(col).ljust(width) for col, width in zip(row, col_widths)))
    assert cursor.description is not None
    return {"res":[[field_md[0] for field_md in cursor.description]] + rows}
  except Exception as e:
    return {"error": str(e)}
# Returns a json describing the database, if the database is not found, returns None
@sql_mcp.resource(
  "db://schema/{db_name*}",
  description="Returns a json describing the database, if the database if not found, returns None|db_name:database name,string",
  mime_type="application/json"
)
def get_schema(db_name: Annotated[str, "Database name"]):
  """Returns a json describing the database, if the database is not found, returns None"""
  res =  query_db(
    f"""
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE, DATETIME_PRECISION, COLUMN_KEY, COLUMN_COMMENT, GENERATION_EXPRESSION
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = '{db_name}';
    """)["res"]
  if len(res) == 1:
    return None
  d = {}
  p = {}
  k = {}
  for r in res:
    if(r != res[0]):
      d[r[0]] = {}
    if r[8] == 'PRI':
      p[r[1]] = r[0]
      if r[0] in k:
        k[r[0]] += ", " + r[1]
      else:
        k[r[0]] = r[1]

  for r in res[1:]:
    des = ""
    des += "type " + r[4]
    if r[8] == "UNI":
      des += ", unique"
    if r[1] in p and p[r[1]] != r[0]:
      des += f", reference table '{p[r[1]]}' column '{r[1]}'"
    d[r[0]][r[1]] = des
  for a, b in k.items():
    d[a]["primary key"] = b
  return d;

@sql_mcp.resource(
  "db://list_databases",
  description="Show available databases",
  mime_type="application/json"
)
def list_databases():
  """Returns a list of databases"""
  res = query_db("SHOW DATABASES WHERE `Database` NOT IN ('mysql', 'performance_schema', 'sys')")["res"]
  r = []
  for row in res:
    r.append(row[0])
  return {r[0]: r[1:]}

@sql_mcp.resource(
  "db://list_tables/{db_name*}",
  description="Show tables within a database|db_name:database name,string",
  mime_type="application/json"
)
def list_tables(db_name: Annotated[str, "Database name"]):
  """Returns a list of tables in the database"""
  res = query_db(f"SHOW TABLES FROM {db_name}")["res"]
  r = []
  for row in res:
    r.append(row[0])
  return {r[0]: r[1:]}

# query_db("SHOW DATABASES;", True)
def close_connection():
  mydb.close()
