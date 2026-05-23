# cafe-menu-rag

A RAG evaluation framework for cafe AI assistants using Promptfoo and Claude. It tests menu and food item Q&A accuracy alongside store info and customer service conversation flows.

## What This Does

AI-powered cafe assistants are only useful if they actually get the answers right. This project evaluates how well a Claude-backed RAG pipeline handles real customer questions — from menu details and dietary info to store hours and order flows.

Two core evaluation areas:

- Menu & Food Q&A — accuracy of responses about items, ingredients, pricing, and dietary options
- Store Info & Customer Service — correctness of hours, location, policies, and conversational flows

## Stack

- Promptfoo — LLM evaluation framework
- Claude — model under test
- JavaScript / TypeScript

## Project Structure

```text
cafe-menu-rag/
├── data/
│   ├── menu.json
│   └── store-info.md
├── src/
│   ├── agents.ts
│   ├── knowledge-base.ts
│   ├── rag-provider.ts
│   ├── retriever.ts
│   └── system-prompt.ts
├── test/
│   └── rag-provider.test.ts
├── .env.example
├── .gitignore
├── output.json
├── package.json
└── promptfooconfig.yaml
```

## Getting Started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` to use Claude.
3. Run `npm test` for focused validation.
4. Run `npm run eval` to execute the Promptfoo suite and write `output.json`.
