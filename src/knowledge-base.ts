import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
}

export interface KnowledgeBase {
  documents: KnowledgeDocument[];
}

const SUPPORTED_EXTENSIONS = new Set(['.json', '.md', '.txt']);

export async function loadKnowledgeBase(directory: string): Promise<KnowledgeBase> {
  const files = await collectFiles(directory);
  const documents = await Promise.all(files.map((filePath) => loadDocumentsFromFile(directory, filePath)));

  return {
    documents: documents.flat(),
  };
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedEntries = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }

      return SUPPORTED_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
    }),
  );

  return nestedEntries.flat().sort();
}

async function loadDocumentsFromFile(rootDirectory: string, filePath: string): Promise<KnowledgeDocument[]> {
  const extension = path.extname(filePath);
  const rawContent = await readFile(filePath, 'utf8');
  const relativePath = path.relative(rootDirectory, filePath);

  if (extension === '.json') {
    return createJsonDocuments(relativePath, rawContent);
  }

  return [
    {
      id: relativePath,
      title: path.basename(filePath, extension),
      content: rawContent.trim(),
      source: relativePath,
    },
  ];
}

function createJsonDocuments(source: string, rawContent: string): KnowledgeDocument[] {
  const parsedContent = JSON.parse(rawContent) as unknown;
  const records = Array.isArray(parsedContent) ? parsedContent : [parsedContent];

  return records.map((record, index) => createJsonDocument(record, source, index)).filter(Boolean) as KnowledgeDocument[];
}

function createJsonDocument(record: unknown, source: string, index: number): KnowledgeDocument | null {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  const normalizedRecord = record as Record<string, unknown>;

  const fields = Object.entries(normalizedRecord).map(([key, value]) => {
    const normalizedValue = Array.isArray(value) ? value.join(', ') : String(value);
    return `${key}: ${normalizedValue}`;
  });

  const title = getPreferredTitle(normalizedRecord, index);

  return {
    id: `${source}#${index}`,
    title,
    content: fields.join('\n'),
    source,
  };
}

function getPreferredTitle(record: Record<string, unknown>, index: number): string {
  const preferredTitle = record.name ?? record.title ?? record.item ?? `document-${index + 1}`;
  return String(preferredTitle);
}
