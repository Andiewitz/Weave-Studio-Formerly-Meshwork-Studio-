import { db } from "./db";
import {
  workspaces,
  nodes,
  edges,
  type InsertWorkspace,
  type Workspace,
  type Node,
  type Edge,
  type InsertNode,
  type InsertEdge,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getWorkspaces(userId?: string): Promise<Workspace[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace>;
  deleteWorkspace(id: number): Promise<void>;

  // Canvas operations
  getNodes(workspaceId: number): Promise<Node[]>;
  getEdges(workspaceId: number): Promise<Edge[]>;
  syncCanvas(workspaceId: number, nodes: InsertNode[], edges: InsertEdge[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWorkspaces(userId?: string): Promise<Workspace[]> {
    if (!userId) return [];
    return await db.select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .orderBy(desc(workspaces.createdAt));
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const [workspace] = await db
      .insert(workspaces)
      .values(insertWorkspace)
      .returning();
    return workspace;
  }

  async updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace> {
    const [workspace] = await db
      .update(workspaces)
      .set(updates)
      .where(eq(workspaces.id, id))
      .returning();
    return workspace;
  }

  async deleteWorkspace(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(edges).where(eq(edges.workspaceId, id));
      await tx.delete(nodes).where(eq(nodes.workspaceId, id));
      await tx.delete(workspaces).where(eq(workspaces.id, id));
    });
  }

  async getNodes(workspaceId: number): Promise<Node[]> {
    return await db.select().from(nodes).where(eq(nodes.workspaceId, workspaceId));
  }

  async getEdges(workspaceId: number): Promise<Edge[]> {
    return await db.select().from(edges).where(eq(edges.workspaceId, workspaceId));
  }

  async syncCanvas(workspaceId: number, newNodes: InsertNode[], newEdges: InsertEdge[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Clear existing
      await tx.delete(edges).where(eq(edges.workspaceId, workspaceId));
      await tx.delete(nodes).where(eq(nodes.workspaceId, workspaceId));

      // Insert new
      if (newNodes.length > 0) {
        await tx.insert(nodes).values(newNodes.map(n => ({ ...n, workspaceId })));
      }
      if (newEdges.length > 0) {
        await tx.insert(edges).values(newEdges.map(e => ({ ...e, workspaceId })));
      }
    });
  }
}

export class MemStorage implements IStorage {
  private workspaces: Map<number, Workspace>;
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;
  private currentId: number;

  constructor() {
    this.workspaces = new Map();
    this.nodes = new Map();
    this.edges = new Map();
    this.currentId = 1;
  }

  async getWorkspaces(userId?: string): Promise<Workspace[]> {
    if (!userId) return [];
    return Array.from(this.workspaces.values())
      .filter((w) => w.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const id = this.currentId++;
    const workspace: Workspace = {
      ...insertWorkspace,
      type: insertWorkspace.type ?? "system",
      id,
      createdAt: new Date(),
      userId: insertWorkspace.userId ?? null, // Ensure userId is handled if present in InsertWorkspace
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  async updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace> {
    const existing = this.workspaces.get(id);
    if (!existing) throw new Error("Workspace not found");
    const updated = { ...existing, ...updates };
    this.workspaces.set(id, updated);
    return updated;
  }

  async deleteWorkspace(id: number): Promise<void> {
    this.workspaces.delete(id);
    // Cleanup nodes/edges
    for (const [nodeId, node] of Array.from(this.nodes.entries())) {
      if (node.workspaceId === id) this.nodes.delete(nodeId);
    }
    for (const [edgeId, edge] of Array.from(this.edges.entries())) {
      if (edge.workspaceId === id) this.edges.delete(edgeId);
    }
  }

  async getNodes(workspaceId: number): Promise<Node[]> {
    return Array.from(this.nodes.values()).filter((n) => n.workspaceId === workspaceId);
  }

  async getEdges(workspaceId: number): Promise<Edge[]> {
    return Array.from(this.edges.values()).filter((e) => e.workspaceId === workspaceId);
  }

  async syncCanvas(workspaceId: number, newNodes: InsertNode[], newEdges: InsertEdge[]): Promise<void> {
    // Clear existing for this workspace
    for (const [id, node] of Array.from(this.nodes.entries())) {
      if (node.workspaceId === workspaceId) this.nodes.delete(id);
    }
    for (const [id, edge] of Array.from(this.edges.entries())) {
      if (edge.workspaceId === workspaceId) this.edges.delete(id);
    }

    // Add new
    for (const n of newNodes) {
      this.nodes.set(n.id, { ...n, workspaceId } as Node);
    }
    for (const e of newEdges) {
      this.edges.set(e.id, { ...e, workspaceId } as Edge);
    }
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

