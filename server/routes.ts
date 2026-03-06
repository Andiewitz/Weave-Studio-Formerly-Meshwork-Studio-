import type { Express } from "express";
import type { Server } from "http";
import { AuthModule } from "./modules/auth";
import { WorkspaceModule } from "./modules/workspace";
import { CanvasModule } from "./modules/canvas";
import { AIModule } from "./modules/ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Auth Module first (as other modules might depend on its middleware)
  await AuthModule.initialize(app);

  // Initialize Workspace Module (handles collections and workspaces)
  WorkspaceModule.initialize(app);

  // Initialize Canvas Module (handles nodes and edges)
  CanvasModule.initialize(app);

  // Initialize AI Module (handles BYOK AI service)
  AIModule.initialize(app);

  console.log("[Monolith] All modules initialized");

  return httpServer;
}
