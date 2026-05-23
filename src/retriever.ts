import type { KnowledgeBase, KnowledgeDocument } from './knowledge-base.js';

export interface RetrievedDocument extends KnowledgeDocument {
  score: number;
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'do',
  'for',
  'have',
  'how',
  'i',
  'is',
  'it',
  'of',
  'the',
  'to',
  'what',
  'you',
]);

export function retrieveRelevantDocuments(query: string, knowledgeBase: KnowledgeBase, limit = 3): RetrievedDocument[] {
  const queryTokens = tokenize(query);

  return knowledgeBase.documents
    .map((document) => ({
      ...document,
      score: scoreDocument(document, queryTokens),
    }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit);
}

export function formatRetrievedContext(documents: RetrievedDocument[]): string {
  if (documents.length === 0) {
    return 'No relevant cafe knowledge was found.';
  }

  return documents.map((document) => `## ${document.title}\n${document.content}`).join('\n\n');
}

function scoreDocument(document: KnowledgeDocument, queryTokens: string[]): number {
  const documentTokens = new Set(tokenize(`${document.title} ${document.content}`));
  let score = 0;

  for (const token of queryTokens) {
    if (documentTokens.has(token)) {
      score += 1;
    }
  }

  return score;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9$:.+-]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}
