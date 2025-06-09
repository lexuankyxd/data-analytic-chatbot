from dotenv.main import load_dotenv
from fastmcp.client import Client
from fastmcp.client.transports import PythonStdioTransport
import asyncio
from openai import AsyncOpenAI
import json
import os
import helper_functions
import re
import threading
from socketHandler import AllOSSocket
import queue
from asyncio import queues
load_dotenv(dotenv_path="/home/g0dz/projects/da-llm/chatbot/.env")

SYS_PROMPT = {
					"role": "system",
					"content": """You are a helpful assistant. Your job is to assist the user by all means possible.
				 Make sure to format your message like utilizing newlines, lists and tables."""
				}

sock = AllOSSocket(os.getenv("SOCKET_PATH"))

llm = AsyncOpenAI(
  base_url=os.getenv("BASE_API_URL"),
  api_key=os.getenv("ALIBABA_API_KEY")
)

async def mcpCall(tool_call: dict, client):
  # print(tool_call)
  if tool_call["type"] == "tool":
    tmp = json.loads(tool_call["function"]["arguments"])
    if len(tmp.items()) != 0:
      # print(tool_call["function"], tmp)
      return await client.call_tool(tool_call["function"]["name"], tmp)
    else:
      return await client.call_tool(tool_call["function"]["name"])
  if tool_call["type"] == "resource":
    return await client.read_resource(tool_call["function"]["name"])
  if tool_call["type"] == "resource_template":
    a_uri = re.split(r"{|}", tool_call["function"]["name"])
    i = 0

    tmp = json.loads(tool_call["function"]["arguments"])
    for key, value in tmp.items():
      a_uri[i * 2 + 1] = value
      i+=1
    uri = ""
    for s in a_uri:
      uri += s
    return await client.read_resource(uri)

async def main():
  SERVER_PATH = os.getenv("SERVER_PATH")
  EXECUTABLE_PATH = os.getenv("PYTHON_EXECUTABLE_PATH")
  await sock.connect(sock)
  assert SERVER_PATH is not None
  assert EXECUTABLE_PATH is not None
  async with Client(PythonStdioTransport(script_path=SERVER_PATH, python_cmd=EXECUTABLE_PATH)) as client:

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
    # print(json.dumps(list_of_tools, indent=2))
    #
    queue = asyncio.Queue()
    async def worker(queue):
      while True:
        item = await queue.get()
        # for i in item["message"]:
        #   print(i)
        response = await llm.chat.completions.create(
          model="qwen-plus",
          messages=[SYS_PROMPT] + item["message"],
          tools=list_of_tools
        )
        # print(response)
        if response.choices[0].finish_reason == "stop":
          await sock.sendMessage(self=sock ,message=json.dumps({"user": item["user"], "message": {"role": "assistant", "content":response.choices[0].message.content}, "type": "MSG"}))
        elif response.choices[0].finish_reason == "tool_calls":
          tool_calls = [tool.to_dict() for tool in response.choices[0].message.tool_calls]
          await sock.sendMessage(self=sock ,message=json.dumps({"user": item["user"], "message": {"role": "assistant", "content": None, "tool_calls": tool_calls}, "type": "000"}))
          # for i in range(len(tool_calls)):
          #   tool_calls[i]["function"]["arguments"] = json.dumps(tool_calls[i]["function"]["arguments"])
          item["message"] += [{"role": "assistant", "content": None, "tool_calls": tool_calls}]
          for i in range(len(tool_calls)):
            # tool_calls[i]["function"]["arguments"] = json.loads(tool_calls[i]["function"]["arguments"])
            tool_calls[i]["type"] = tool_lookup[tool_calls[i]["function"]["name"]]
            tmp = await mcpCall(tool_calls[i], client)
            item["message"] += [{"role": "tool", "content": tmp[0].text, "tool_call_id": tool_calls[i]["id"]}]
            if "error" in tmp[0].text:
              await sock.sendMessage(self=sock ,message=json.dumps({"user": item["user"], "message": {"role": "tool", "content": tmp[0].text, "tool_call_id": tool_calls[i]["id"]}, "type": "ERR"}))
            else:
              await sock.sendMessage(self=sock ,message=json.dumps({"user": item["user"], "message": {"role": "tool", "content": tmp[0].text, "tool_call_id": tool_calls[i]["id"]}, "type": helper_functions.lookup_tool_code(tool_calls[i]["function"]["name"])}))
          # print(item["message"])
          item["message"]
          await queue.put({"user": item["user"], "message": item["message"]})
        queue.task_done()
    async def producer(queue):
      data_buffer = ''
      while True:
        data = await sock.fetchData(sock, size=1024)
        assert data is not None
        data_buffer += data
        # Process each complete JSON object separated by newline
        while '\n' in data_buffer:
          line, data_buffer = data_buffer.split('\n', 1)
          if line.strip():
            json_obj = json.loads(line.strip())
            # print(json.dumps(json_obj, indent=2))
            await queue.put({"user": json_obj["user"], "message": json_obj["message"]})

    # await asyncio.gather(producer(queue), *[worker(queue) for _ in range(10)])
    await asyncio.gather(producer(queue), *[asyncio.create_task(worker(queue)) for _ in range(5)])
      # sys.stdout.flush()


if __name__ == "__main__":
  asyncio.run(main())
