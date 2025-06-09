- refactor the website source code
- reformat the website
- currently we are attaching 1 mcp server instance to each mcp client instance. Each client handles multiple user, clarify the architecture.
- add support for multiple dbms
- add query safety parsing to SQL mcp, maybe seperate tool that do non read queries?

TODO:
1) Add content access management for the vector store(user A can not access files uploaded by user B, unless with explicit permission) by metadata filtering?
2) Add source description generation for databases, files uploaded so the chatbot can select the right tool
3) Develope set of usecases to test the LLM
4) Read only account for LLM ?
5) On call embedding files instead of looping for RAG MCP server
6) Add streaming message
8) Redesign the user database to incorperate permission
9) Support more file format in the embedding function
10) Explicit database connection (add a connect to database tool and rewrite the list table tool to not take param)
11) Support more DBMS, add option to add a database on the fly and generate description on the fly (maybe also add caching description)
13) Better data representation for the query output (maybe add tool so the LLM can choose a representation most fitting?)
14) Rewrite path variables
16) Better logging
17) 1 device per user session check
18) better ai message rendering
19) MCP client sometime crash when handling vietnamese? maybe not vnmese related idk
20) frontend message display doesn't work without refreshing first
21) Vietnamese encoding is fucked when backend sends to MCP client
22) the fact that the client lives on a python script is fucking stupid, please rewrite it in ts
23) parallelize api calling somehow, race condition and shit
24) prompt for markdown
25) Rate limit
26) Save vector store for the session
