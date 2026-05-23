import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { answerCustomerQuestion } from '../src/agents.js';
import { loadKnowledgeBase } from '../src/knowledge-base.js';
import { runPromptfooProvider } from '../src/rag-provider.js';
import { retrieveRelevantDocuments } from '../src/retriever.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseDirectory = path.resolve(currentDirectory, '../data');

test('loadKnowledgeBase ingests menu and store files', async () => {
  const knowledgeBase = await loadKnowledgeBase(knowledgeBaseDirectory);

  assert.equal(knowledgeBase.documents.length, 4);
  assert.deepEqual(
    knowledgeBase.documents.map((document) => document.title),
    ['Cappuccino', 'Avocado Toast', 'Blueberry Muffin', 'store-info'],
  );
});

test('retrieveRelevantDocuments prioritizes matching cafe facts', async () => {
  const knowledgeBase = await loadKnowledgeBase(knowledgeBaseDirectory);
  const matches = retrieveRelevantDocuments('Do you have oat milk for cappuccinos?', knowledgeBase);

  assert.equal(matches[0]?.title, 'Cappuccino');
});

test('answerCustomerQuestion falls back to grounded context without an API key', async () => {
  const knowledgeBase = await loadKnowledgeBase(knowledgeBaseDirectory);
  const result = await answerCustomerQuestion({
    knowledgeBase,
    question: 'What are your weekday hours?',
  });

  assert.equal(result.usedModel, null);
  assert.match(result.answer, /8:00 AM-6:00 PM/);
});

test('runPromptfooProvider returns a promptfoo-friendly response object', async () => {
  const result = await runPromptfooProvider('Is the avocado toast vegan?', {
    vars: { knowledgeBaseDir: knowledgeBaseDirectory },
  });

  assert.match(result.output, /vegan/i);
  assert.deepEqual(result.metadata.contextSources, ['menu.json']);
});
