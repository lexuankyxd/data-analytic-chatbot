const BASE_URL = 'https://concrete-unlikely-stud.ngrok-free.app';

interface AIResponse {
  ai: string;
}

export async function getAIResponse(message: string, tables: any[][]): Promise<AIResponse> {
  try {
    const response = await fetch(`${BASE_URL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, tables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { ai: "Sorry, I encountered an error processing your request." };
  }
}

export async function executeSQL(query: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `message=${encodeURIComponent('```sql\n' + query + '\n```')}`,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}
