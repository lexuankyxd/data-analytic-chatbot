import { ParsedCodePart } from '../types';

export function extractCodeBlocks(text: string): ParsedCodePart[] {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: ParsedCodePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Add code block
    const language = match[1] || 'plaintext';
    const code = match[2].trim();
    parts.push({
      type: 'code',
      language: language,
      content: code
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return parts;
}
