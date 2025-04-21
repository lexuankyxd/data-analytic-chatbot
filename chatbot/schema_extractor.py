import mysql.connector

# Kết nối MySQL
connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='password',
    database='employees'
)

cursor = connection.cursor()

# Danh sách bảng cần xuất
cursor.execute("SHOW TABLES")
tables = [row[0] for row in cursor.fetchall()]

schema_str = ""
for idx in range(len(tables)):
    table = tables[idx]

    # Lấy thông tin cột: tên cột và kiểu dữ liệu
    cursor.execute(f"""
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'employees' AND TABLE_NAME = '{table}'
    """)
    columns = cursor.fetchall()
    column_types = {col[0]: col[1] for col in columns}
    # Lấy khóa chính
    cursor.execute(f"""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'employees'
          AND TABLE_NAME = '{table}'
          AND CONSTRAINT_NAME = 'PRIMARY'
    """)
    primary_keys = [row[0] for row in cursor.fetchall()]
    # Lấy khóa ngoại
    cursor.execute(f"""
        SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'employees'
          AND TABLE_NAME = '{table}'
          AND REFERENCED_TABLE_NAME IS NOT NULL
    """)
    foreign_keys = [list(row) for row in cursor.fetchall()]
    schema_str += f"\"{table}\" "
    for col_name, data_type in column_types.items():
      b = False
      for r in foreign_keys:
        if col_name in r:
          r.append(data_type)
          b = True
          break;
      if(b):
        continue
      schema_str += f"\"{col_name}\" {data_type}, "

    schema_str += "foreign_key: "
    for i in range(len(foreign_keys)):
      fk = foreign_keys[i]
      schema_str += f"\"{fk[0]}\" {fk[3]} from \"{fk[1]}\" \"{fk[2]}\""
      if(i != len(foreign_keys) - 1):
        schema_str += ", "
      else:
        schema_str += " "
    schema_str += "primary_key: "

    for i in range(len(primary_keys)):
      schema_str += f"\"{primary_keys[i]}\""
      if(i != len(primary_keys) - 1):
        schema_str += ", "
      else:
        schema_str += " "
    if(idx != len(tables) - 1):
      schema_str += '[SEP] '
    foreign_keys.clear()
    primary_keys.clear()
print(schema_str)
