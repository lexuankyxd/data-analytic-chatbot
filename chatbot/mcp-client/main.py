from dotenv.main import load_dotenv
from fastmcp.client import Client
from fastmcp.client.transports import PythonStdioTransport
import asyncio
from openai import AsyncOpenAI
import json
import os
import helper_functions
import re
import socket
import threading
load_dotenv(dotenv_path="/home/g0dz/projects/da-llm/chatbot/.env")
headers = {"Authorization": "Bearer mytoken"}
message_history = {}
message_queue = []

sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.connect(os.getenv("SOCKET_PATH"))

async def mcpCall(tool_call: dict, client):
  if tool_call["type"] == "tool":
    if len(tool_call["function"]["arguments"].items()) != 0:
      return await client.call_tool(tool_call["function"]["name"], tool_call["function"]["arguments"])
    else:
      return await client.call_tool(tool_call["function"]["name"])
  if tool_call["type"] == "resource":
    return await client.read_resource(tool_call["function"]["name"])
  if tool_call["type"] == "resource_template":
    a_uri = re.split(r"{|}", tool_call["function"]["name"])
    i = 0
    for key, value in tool_call["function"]["arguments"].items():
      a_uri[i * 2 + 1] = value
      i+=1
    uri = ""
    for s in a_uri:
      uri += s
    return await client.read_resource(uri)

async def main():
  async with Client(PythonStdioTransport(script_path="/home/g0dz/projects/da-llm/chatbot/mcp-server/server.py", python_cmd="/home/g0dz/projects/da-llm/.venv/bin/python")) as client:

    tool_list = await client.list_tools()
    resource_list = await client.list_resources()
    resource_template_list = await client.list_resource_templates()
    tools = [json.loads(tool.model_dump_json()) for tool in tool_list]
    tools = helper_functions.mcp_tools_to_tool_list(tools)
    resources = [json.loads(resource.model_dump_json()) for resource in resource_list]
    resources = helper_functions.mcp_resources_to_tool_list(resources)
    resource_templates = [json.loads(resource_template.model_dump_json()) for resource_template in resource_template_list]
    resource_templates = helper_functions.mcp_resource_templates_to_tool_list(resource_templates)

    tool_list = [tool["function"]["name"] for tool in tools]
    resource_list = [resource["function"]["name"] for resource in resources]
    resource_template_list = [resource_template["function"]["name"] for resource_template in resource_templates]
    tool_lookup={}
    for tool in tool_list:
      tool_lookup[tool] = "tool"
    for resource in resource_list:
      tool_lookup[resource] = "resource"
    for resource_template in resource_template_list:
      tool_lookup[resource_template] = "resource_template"

    list_of_tools = tools + resources + resource_templates
    # for tool in list_of_tools:
    #   print(json.dumps(tool, indent=2))
    llm = AsyncOpenAI(
      base_url=os.getenv("BASE_API_URL"),
      api_key=os.getenv("ALIBABA_API_KEY")
    )
    usage = {
      "completion_tokens": 0,
      "prompt_tokens": 0,
      "total_tokens": 0,
      "cached_tokens": 0
    }
    tool_called = False;
    # print(json.dumps(list_of_tools, indent=2))
    while True:
      if len(message_queue) == 0:
        continue

      item = message_queue.pop(0)
      if item["user"] not in message_history:
        message_history[item["user"]] = []
      message_history[item["user"]].append(item["message"])
      # for m in message_history:
      #   print(m)
      response = await llm.chat.completions.create(
        model="qwen-plus",
        messages=message_history[item["user"]],
        tools=list_of_tools
      )
      try:
      #logging usage
        usage["completion_tokens"] += response.usage.completion_tokens
        usage["prompt_tokens"] += response.usage.prompt_tokens
        usage["total_tokens"] += response.usage.total_tokens
        usage["cached_tokens"] += response.usage.prompt_tokens_details.cached_tokens
      except Exception as e:
        pass

      if response.choices is None or len(response.choices) == 0:
        print("ERROR: RECEIVED EMPTY CHOICES ARRAY OR CHOICES NOT IN RESPONSE")
        continue
      if response.choices[0].finish_reason == "stop":
        message_history[item["user"]].append({"role": "assistant", "content": response.choices[0].message.content})
        sock.sendall(json.dumps({"user": item["user"], "message": response.choices[0].message.content, "type": "MSG"}).encode("utf-8") + b'\r\n')
      elif response.choices[0].finish_reason == "tool_calls":
        tool_calls = [tool.to_dict() for tool in response.choices[0].message.tool_calls]
        message_history[item["user"]].append({"role": "assistant", "content": None, "tool_calls": response.choices[0].message.tool_calls})
        tool_called=True
        for i in range(len(tool_calls)):
          tool_calls[i]["function"]["arguments"] = json.loads(tool_calls[i]["function"]["arguments"])
          sock.sendall(json.dumps({"user": item["user"], "message": json.dumps(tool_calls[i]), "type": "TL0"}).encode("utf-8") + b'\r\n')
          tool_calls[i]["type"] = tool_lookup[tool_calls[i]["function"]["name"]]
          tmp = await mcpCall(tool_calls[i], client)
          message_queue.append({"user": item["user"], "message": {"role": "tool", "content": tmp[0].text, "tool_call_id": tool_calls[i]["id"]}})
          sock.sendall(json.dumps({"user": item["user"], "message": json.dumps(json.loads(tmp[0].text), indent=2, ensure_ascii=False), "type": "TL1"}).encode("utf-8") + b'\r\n')
      # sys.stdout.flush()
    for message in message_history:
      if "tool_calls" in message:
        message["tool_calls"] = [it.to_dict() for it in message["tool_calls"]]
      print(message)
    print(json.dumps(usage, indent=2))

def inputToMessageQueue():
  data_buffer = ''
  while True:
    data = sock.recv(1024).decode('utf-8')
    data_buffer += data
    # Process each complete JSON object separated by newline
    while '\n' in data_buffer:
      line, data_buffer = data_buffer.split('\n', 1)
      if line.strip():
        json_obj = json.loads(line.strip())
        print("received: " + json.dumps(json_obj, indent=2))
        message_queue.append({"user": json_obj["user"], "message": {"role": "user", "content": json_obj["message"]}})

if __name__ == "__main__":
  t1 = threading.Thread(target=inputToMessageQueue, name="input to message queue")
  t1.start()
  asyncio.run(main())
  t1.join()
