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

export function getCurrentTimestamp() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function parseSchemaJson(schemaJson: string): { tables } {
  // Parse the JSON string into an object
  const schemaObj = JSON.parse(schemaJson);

  const tables = Object.entries(schemaObj).map(([tableName, columns]) => {
    // columns is an object: { columnName: columnDescription, ... }
    const fields = Object.entries(columns as Record<string, string>).map(
      ([columnName, columnInfo]) => {
        // columnInfo example: "type int, reference table 'titles' column 'emp_no'"
        // We want to extract the type and description separately

        // Extract the type part (starts with "type ...")
        // and the rest as description

        // A simple approach: split by comma, first part contains type info
        const parts = columnInfo.split(',');

        // Extract type string (remove leading/trailing spaces)
        const typePart = parts[0].trim();

        // Extract type value after "type "
        const typeMatch = typePart.match(/^type\s+(.+)$/i);
        const type = typeMatch ? typeMatch[1].toUpperCase() : "UNKNOWN";

        // Description is the full columnInfo string, or you can join the rest parts
        // For better description, join all parts except the first
        const description = parts.slice(1).map(p => p.trim()).join(', ') || typePart;

        return {
          name: columnName,
          type,
          description,
        };
      }
    );

    return {
      name: tableName,
      fields,
    };
  });

  return { tables };
}

export function processToolMessages(id: string, type: string, data: string) {
  let tmp: any;
  let out_data: any;
  switch (type) {
    case "000":
      tmp = JSON.parse(data);
      out_data = { arguments: tmp.function.arguments, name: tmp.function.name }
      break;
    case "001":
      out_data = parseSchemaJson(data);
      break;
    case "002":
      tmp = JSON.parse(data);
      out_data = { tables: (tmp[Object.keys(tmp)[0]] as string[][]).flat() };
      break;
    case "003":
      tmp = JSON.parse(data);
      out_data = { databases: (tmp[Object.keys(tmp)[0]] as string[][]).flat() };
      console.log(out_data)
      break;
    case "004":
    case "005":
    case "ERR":
      out_data = JSON.parse(data)
      break;
    default:
      break;
  }
  return { id, type, timestamp: getCurrentTimestamp(), expanded: false, data: out_data };
}
