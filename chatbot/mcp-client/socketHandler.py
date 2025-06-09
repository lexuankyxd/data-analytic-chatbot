import sys
class AllOSSocket:
  def __init__(self, path):
    if (sys.platform.startswith('linux')):
      import asyncio
      self.path = path
      self.reader = None
      self.writer = None
      async def connect(self):
          self.reader, self.writer = await asyncio.open_unix_connection(self.path)
      async def sendMessage(self, message: str):
          if self.writer is None:
              raise ConnectionError("Socket is not connected.")
          self.writer.write(message.encode("utf-8") + b'\r\n')
          await self.writer.drain()

      async def fetchData(self, size: int) -> str:
          if self.reader is None:
              raise ConnectionError("Socket is not connected.")
          data = await self.reader.read(size)
          return data.decode('utf-8')

      def close(self):
          if self.writer is not None:
              self.writer.close()

      async def wait_closed(self):
          if self.writer is not None:
              await self.writer.wait_closed()
      self.connect = connect
      self.sendMessage = sendMessage
      self.fetchData = fetchData
      self.close = close
      self.wait_closed = wait_closed
    # elif (sys.platform.startswith('win32')):
    #   import win32pipe
    #   import win32file
    #   import pywintypes

    #   try:
    #     # Connect to the named pipe
    #     handle = win32file.CreateFile(
    #       path,
    #       win32file.GENERIC_READ | win32file.GENERIC_WRITE,
    #       0,
    #       None,
    #       win32file.OPEN_EXISTING,
    #       0,
    #       None
    #     )

    #       # Set pipe mode to message mode
    #     win32pipe.SetNamedPipeHandleState(
    #       handle.handle,
    #       win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
    #       None,
    #       None
    #     )

    #     def sendMessage(message):
    #       # Write message to pipe
    #       win32file.WriteFile(handle.handle, message.encode("utf-8") + b'\r\n')

    #     async def fetchData(size):
    #       # Read from pipe
    #       hr, data = win32file.ReadFile(handle.handle, size)
    #       return data

    #     def close(self):
    #       win32file.CloseHandle(handle.handle)

    #     self.sendMessage = sendMessage
    #     self.fetchData = fetchData
    #     self.close = close

    #   except pywintypes.error as e:
    #     print(f"Error connecting to pipe: {e}")
    #     self.sendMessage = lambda msg: None
    #     self.fetchData = lambda size=65535: None
    #     self.close = lambda: None
