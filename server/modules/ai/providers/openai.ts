import OpenAI from "openai";

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
 * OpenAI Provider Handler
 * Makes requests to OpenAI API using user's API key
 */
export async function createOpenAIChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): Promise<ReadableStream | object> {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: request.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    stream: request.stream ?? false,
  });
  
  return response;
}

/**
 * OpenAI Streaming Chat Completion
 */
export async function* streamOpenAIChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const openai = new OpenAI({ apiKey });
  
  const stream = await openai.chat.completions.create({
    model: request.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    stream: true,
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Validate OpenAI API key by making a simple request
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const openai = new OpenAI({ apiKey });
    await openai.models.list();
    return true;
  } catch (error) {
    return false;
  }
}

export const openAIModels = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
];
