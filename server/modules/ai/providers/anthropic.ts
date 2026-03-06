export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Anthropic Provider Handler
 * Makes requests to Anthropic API using user's API key
 */
export async function createAnthropicChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): Promise<Response> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages.filter(m => m.role !== "system"),
      system: request.messages.find(m => m.role === "system")?.content,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: request.stream ?? false,
    }),
  });
  
  return response;
}

/**
 * Anthropic Streaming Chat Completion
 */
export async function* streamAnthropicChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages.filter(m => m.role !== "system"),
      system: request.messages.find(m => m.role === "system")?.content,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: true,
    }),
  });
  
  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta") {
            yield parsed.delta?.text || "";
          }
        } catch {
          // Ignore parse errors for empty lines
        }
      }
    }
  }
}

/**
 * Validate Anthropic API key
 */
export async function validateAnthropicKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export const anthropicModels = [
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
];
