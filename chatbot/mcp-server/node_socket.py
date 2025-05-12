import socket
import os

SOCK_FILE = '/home/g0dz/projects/da-llm/socket/file_transfer.sock'

# Remove socket file if it exists
if os.path.exists(SOCK_FILE):
    os.remove(SOCK_FILE)

server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(SOCK_FILE)
server.listen(1)

print(f"Listening on {SOCK_FILE}")

conn, _ = server.accept()
print("Client connected")

with open('received_file', 'wb') as f:
    while True:
        data = conn.recv(4096)
        if not data:
            break
        f.write(data)

print("File received successfully")

conn.close()
server.close()
os.remove(SOCK_FILE)
