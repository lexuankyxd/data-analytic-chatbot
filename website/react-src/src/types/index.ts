export interface Message {
  type: 'user' | 'ai';
  content: string;
  codeBlocks?: number;
}

export interface CodeBlock {
  language: string;
  content: string;
  executed: boolean;
}

export interface QueryResult {
  id: number;
  query: string;
  html?: string;
  error?: string;
  selected: boolean;
}

export interface ParsedCodePart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}
