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
7) Migrate to SQLite for user data
8) Redesign the user database to incorperate permission
9) Support more file format in the embedding function
10) Explicit database connection (add a connect to database tool and rewrite the list table tool to not take param)
11) Support more DBMS, add option to add a database on the fly and generate description on the fly (maybe also add caching description)
12) Maybe migrate the MCP client to the FE
13) Better data representation for the query output (maybe add tool so the LLM can choose a representation most fitting?)
14) Rewrite path variables
15) Frontend file upload
16) Better logging
