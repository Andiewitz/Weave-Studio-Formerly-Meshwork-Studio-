import type { Express } from "express";
import aiRoutes from "./routes";

/**
 * AI Module - BYOK (Bring Your Own Key) AI Service
 * 
 * This module provides:
 * - Secure encrypted storage of user API keys
 * - Server-side proxy to AI providers (OpenAI, Anthropic, etc.)
 * - Key management endpoints
 */

export class AIModule {
  static initialize(app: Express) {
    // Mount AI routes under /api/ai
    app.use("/api/ai", aiRoutes);
    
    console.log("[AIModule] AI service initialized at /api/ai");
  }
}

export * from "./encryption";
export * from "./db";
