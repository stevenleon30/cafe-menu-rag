import { CAFE_ASSISTANT_SYSTEM_PROMPT } from './system-prompt.js';
import type { KnowledgeBase } from './knowledge-base.js';
import { formatRetrievedContext, retrieveRelevantDocuments } from './retriever.js';

const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface AnswerCustomerQuestionOptions {
  apiKey?: string;
  fetcher?: typeof fetch;
  knowledgeBase: KnowledgeBase;
  model?: string;
  question: string;
}

export interface AnswerCustomerQuestionResult {
  answer: string;
  context: ReturnType<typeof retrieveRelevantDocuments>;
  usedModel: string | null;
}

export async function answerCustomerQuestion({
  apiKey,
  fetcher = fetch,
  knowledgeBase,
  model = DEFAULT_MODEL,
  question,
}: AnswerCustomerQuestionOptions): Promise<AnswerCustomerQuestionResult> {
  const context = retrieveRelevantDocuments(question, knowledgeBase);
  const contextText = formatRetrievedContext(context);

  if (!apiKey) {
    return {
      answer: createGroundedFallbackAnswer(context),
      context,
      usedModel: null,
    };
  }

  const response = await fetcher(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      system: CAFE_ASSISTANT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Customer question: ${question}\n\nRetrieved cafe knowledge:\n${contextText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AnthropicMessageResponse;
  const answer = payload.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text.trim())
    .join('\n')
    .trim();

  return {
    answer: answer || createGroundedFallbackAnswer(context),
    context,
    usedModel: model,
  };
}

function createGroundedFallbackAnswer(context: ReturnType<typeof retrieveRelevantDocuments>): string {
  if (context.length === 0) {
    return 'I do not have enough information in the cafe knowledge base to answer that question yet.';
  }

  return [
    'Based on the cafe knowledge base:',
    ...context.map((document) => `- ${document.title}: ${summarize(document.content)}`),
  ].join('\n');
}

function summarize(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

interface AnthropicTextBlock {
  text: string;
  type: 'text';
}

interface AnthropicMessageResponse {
  content: AnthropicTextBlock[];
}
