#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { answerCustomerQuestion } from './agents.js';
import { loadKnowledgeBase } from './knowledge-base.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

interface PromptfooExecutionContext {
  vars?: Record<string, unknown>;
}

export async function runPromptfooProvider(prompt: string, context: PromptfooExecutionContext = {}) {
  const knowledgeBaseDirectory = resolveKnowledgeBaseDirectory(context);
  const knowledgeBase = await loadKnowledgeBase(knowledgeBaseDirectory);
  const result = await answerCustomerQuestion({
    knowledgeBase,
    ...(process.env.ANTHROPIC_API_KEY ? { apiKey: process.env.ANTHROPIC_API_KEY } : {}),
    ...(process.env.ANTHROPIC_MODEL ? { model: process.env.ANTHROPIC_MODEL } : {}),
    question: prompt,
  });

  return {
    output: result.answer,
    metadata: {
      contextSources: result.context.map((document) => document.source),
      usedModel: result.usedModel,
    },
  };
}

function resolveKnowledgeBaseDirectory(context: PromptfooExecutionContext): string {
  const configuredPath =
    typeof context.vars?.knowledgeBaseDir === 'string'
      ? context.vars.knowledgeBaseDir
      : process.env.KNOWLEDGE_BASE_DIR;

  return configuredPath ? path.resolve(configuredPath) : path.resolve(currentDirectory, '../data');
}

async function main() {
  const [prompt, _rawOptions, rawContext] = process.argv.slice(2);

  if (!prompt) {
    throw new Error('Expected the customer prompt as the first argument.');
  }

  const parsedContext = rawContext ? (JSON.parse(rawContext) as PromptfooExecutionContext) : {};
  const result = await runPromptfooProvider(prompt, parsedContext);
  process.stdout.write(result.output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  await main();
}
