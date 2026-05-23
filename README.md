A RAG evaluation framework for cafe AI assistants using Promptfoo and Claude. Tests menu and food item Q&A accuracy alongside store info and customer service conversation flows.

What This Does
AI-powered cafe assistants are only useful if they actually get the answers right. This project evaluates how well a Claude-backed RAG pipeline handles real customer questions — from menu details and dietary info to store hours and order flows.
Two core evaluation areas:

Menu & Food Q&A — accuracy of responses about items, ingredients, pricing, and dietary options
Store Info & Customer Service — correctness of hours, location, policies, and conversational flows


Stack

Promptfoo — LLM evaluation framework
Claude — model under test
JavaScript / TypeScript


Project Structure
cafe-menu-rag/
├── src/
│   ├── agents.ts            # Orchestrates RAG flow and Claude API calls
│   ├── knowledge-base.ts    # Loads and parses cafe data files
│   ├── rag-provider.ts      # Promptfoo provider — entry point for each eval test
│   ├── retriever.ts         # Searches knowledge base for relevant context
│   └── system-prompt.ts     # Claude system prompt for the cafe assistant
├── .env.example             # Required environment variables (safe to commit)
├── .gitignore
├── output.json              # Latest eval results output
├── package.json
└── promptfooconfig.yaml     # Main eval config (providers, test cases, assertions)

Getting Started
1. Clone the repo
bashgit clone https://github.com/stevenleon30/cafe-menu-rag.git
cd cafe-menu-rag
