- refactor the website source code
- reformat the website
- Add session management (ping pong system, message history seperation, login ?)
- add changing text splitting method for each type of input files
- session separated vector store
- universal vector store?
- add selection between different databases
- create a special read only account for LLM
- currently we are attaching 1 mcp server instance to each mcp client instance. Each client handles multiple user, clarify the architecture.
- add support for multiple dbms
- add query safety parsing to SQL mcp, maybe seperate tool that do non read queries?
- queries that returns hugh amount of data? -> need ways to efficiently extract insight from data like a graph or smth
- make sure the LLM knows which tools are from which source of data?


CONNECTABILITY TABLE:
|FUNCTIONALITY|FE->BE|BE->MCP_CLIENT|
|--|--|--|
|A|A|A|
