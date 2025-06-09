import sys
class AllOSSocket:
  def __init__(self, path):
    if (sys.platform.startswith('linux')):
      import socket
      sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
      sock.connect(path)
      self.sock = sock
      def sendMessage(message):
        sock.sendall(message.encode("utf-8") + b'\r\n')
      def fetchData(size):
        return sock.recv(size).decode('utf-8')
      def close():
        sock.close()
      self.sendMessage = sendMessage
      self.fetchData = fetchData
      self.close = close
    elif (sys.platform.startswith('win32')):
      import win32pipe
      import win32file
      import pywintypes

      try:
        # Connect to the named pipe
        handle = win32file.CreateFile(
          path,
          win32file.GENERIC_READ | win32file.GENERIC_WRITE,
          0,
          None,
          win32file.OPEN_EXISTING,
          0,
          None
        )

          # Set pipe mode to message mode
        win32pipe.SetNamedPipeHandleState(
          handle.handle,
          win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
          None,
          None
        )

        def sendMessage(message):
          # Write message to pipe
          win32file.WriteFile(handle.handle, message.encode("utf-8") + b'\r\n')

        def fetchData(size):
          # Read from pipe
          hr, data = win32file.ReadFile(handle.handle, size)
          return data

        def close():
          win32file.CloseHandle(handle.handle)

        self.sendMessage = sendMessage
        self.fetchData = fetchData
        self.close = close

      except pywintypes.error as e:
        print(f"Error connecting to pipe: {e}")
        self.sendMessage = lambda msg: None
        self.fetchData = lambda size=65535: None
        self.close = lambda: None
