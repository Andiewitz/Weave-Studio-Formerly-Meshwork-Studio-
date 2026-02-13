import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Workspace routes
  app.get(api.workspaces.list.path, isAuthenticated, async (req, res) => {
    // req.user is typed as any in the auth module, but we know it has claims
    const userId = (req.user as any).claims.sub;
    const workspaces = await storage.getWorkspaces(userId);
    res.json(workspaces);
  });

  app.get(api.workspaces.get.path, isAuthenticated, async (req, res) => {
    const workspace = await storage.getWorkspace(Number(req.params.id));
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    // Check ownership
    const userId = (req.user as any).claims.sub;
    if (workspace.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(workspace);
  });

  app.post(api.workspaces.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.workspaces.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      const workspace = await storage.createWorkspace({
        ...input,
        userId: userId
      });
      res.status(201).json(workspace);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.workspaces.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getWorkspace(id);
      if (!existing) return res.status(404).json({ message: "Not found" });

      const userId = (req.user as any).claims.sub;
      if (existing.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const input = api.workspaces.update.input.parse(req.body);
      const updated = await storage.updateWorkspace(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.workspaces.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getWorkspace(id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    const userId = (req.user as any).claims.sub;
    if (existing.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

    await storage.deleteWorkspace(id);
    res.status(204).send();
  });

  // Canvas routes
  app.get(api.workspaces.getCanvas.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const workspace = await storage.getWorkspace(id);
    if (!workspace) return res.status(404).json({ message: "Not found" });

    const userId = (req.user as any).claims.sub;
    if (workspace.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

    const nodes = await storage.getNodes(id);
    const edges = await storage.getEdges(id);
    res.json({ nodes, edges });
  });

  app.post(api.workspaces.syncCanvas.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const workspace = await storage.getWorkspace(id);
    if (!workspace) return res.status(404).json({ message: "Not found" });

    const userId = (req.user as any).claims.sub;
    if (workspace.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

    const { nodes: newNodes, edges: newEdges } = api.workspaces.syncCanvas.input.parse(req.body);
    await storage.syncCanvas(id, newNodes, newEdges);
    res.json({ success: true });
  });

  return httpServer;
}
