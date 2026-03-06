import { Router, Request, Response } from "express";
import { isAuthenticated } from "../auth/authCore";
import { createApiKey, deleteApiKey, getUserApiKeys, toggleKeyStatus, getApiKeyWithPlaintext } from "./db";
import { validateKeyFormat } from "./encryption";

const router = Router();

/**
 * GET /api/ai/keys
 * List all API keys for the current user (returns hints only, never full keys)
 */
router.get("/keys", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keys = await getUserApiKeys(userId);
    
    // Return keys without encrypted data
    res.json(keys.map(key => ({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
      createdAt: key.createdAt,
    })));
  } catch (error) {
    console.error("[AI] Failed to list keys:", error);
    res.status(500).json({ error: "Failed to retrieve API keys" });
  }
});

/**
 * POST /api/ai/keys
 * Add a new API key (encrypted and stored)
 */
router.post("/keys", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider, apiKey } = req.body;
    
    // Validate input
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Provider and apiKey are required" });
    }
    
    // Validate key format
    if (!validateKeyFormat(provider, apiKey)) {
      return res.status(400).json({ 
        error: `Invalid API key format for ${provider}` 
      });
    }
    
    // Create encrypted key
    const key = await createApiKey({ userId, provider, apiKey });
    
    res.status(201).json({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
      createdAt: key.createdAt,
    });
  } catch (error) {
    console.error("[AI] Failed to create key:", error);
    res.status(500).json({ error: "Failed to store API key" });
  }
});

/**
 * POST /api/ai/keys/test
 * Test an API key without storing it
 */
router.post("/keys/test", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Provider and apiKey are required" });
    }
    
    // Validate format
    if (!validateKeyFormat(provider, apiKey)) {
      return res.status(400).json({ 
        error: `Invalid API key format for ${provider}` 
      });
    }
    
    // TODO: Actually test the key by making a small request to the provider
    // For now, just validate format
    
    res.json({ 
      valid: true, 
      message: "Key format is valid (actual API test not implemented yet)" 
    });
  } catch (error) {
    console.error("[AI] Failed to test key:", error);
    res.status(500).json({ error: "Failed to test API key" });
  }
});

/**
 * DELETE /api/ai/keys/:id
 * Delete an API key
 */
router.delete("/keys/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;
    
    const deleted = await deleteApiKey(userId, keyId);
    
    if (!deleted) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("[AI] Failed to delete key:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

/**
 * POST /api/ai/keys/:id/toggle
 * Toggle key active status
 */
router.post("/keys/:id/toggle", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;
    const { isActive } = req.body;
    
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive boolean is required" });
    }
    
    const key = await toggleKeyStatus(userId, keyId, isActive);
    
    if (!key) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
    });
  } catch (error) {
    console.error("[AI] Failed to toggle key:", error);
    res.status(500).json({ error: "Failed to update API key" });
  }
});

/**
 * POST /api/ai/chat
 * Proxy chat completion request to AI provider using user's stored key
 */
router.post("/chat", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider, model, messages, temperature, maxTokens, stream } = req.body;
    
    if (!provider || !model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "provider, model, and messages are required" });
    }
    
    // Get user's API key for this provider
    const apiKeyRecord = await getApiKeyWithPlaintext(userId, provider);
    
    if (!apiKeyRecord) {
      return res.status(404).json({ 
        error: `No API key found for provider: ${provider}. Please add a key in settings.` 
      });
    }
    
    if (!apiKeyRecord.isActive) {
      return res.status(403).json({ 
        error: `API key for ${provider} is disabled.` 
      });
    }
    
    const apiKey = apiKeyRecord.plaintextKey;
    
    // Route to appropriate provider
    if (provider === "openai") {
      const { createOpenAIChatCompletion } = await import("./providers/openai");
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const { streamOpenAIChatCompletion } = await import("./providers/openai");
        const stream = streamOpenAIChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: true,
        });
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const response = await createOpenAIChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: false,
        });
        res.json(response);
      }
    } else if (provider === "anthropic") {
      const { createAnthropicChatCompletion, streamAnthropicChatCompletion } = await import("./providers/anthropic");
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const stream = streamAnthropicChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: true,
        });
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const response = await createAnthropicChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: false,
        });
        
        const data = await response.json();
        res.json(data);
      }
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (error) {
    console.error("[AI] Chat completion failed:", error);
    res.status(500).json({ error: "Failed to complete chat request" });
  }
});

/**
 * GET /api/ai/providers
 * List supported AI providers
 */
router.get("/providers", isAuthenticated, async (_req: Request, res: Response) => {
  res.json([
    { id: "openai", name: "OpenAI", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-3-5-sonnet", "claude-3-opus"] },
    { id: "google", name: "Google AI", models: ["gemini-pro"] },
  ]);
});

export default router;
