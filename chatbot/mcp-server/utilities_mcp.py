from fastmcp import FastMCP
import json
utilities_mcp = FastMCP()

@utilities_mcp.resource(
  "utils://list_tool_source",
  description="Shows sources of data and what tool query it.",
  mime_type="application/json"
)
def list_tool_source():
  return json.load(open("./tool_source.json", 'r'))
