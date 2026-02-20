import { db } from "./db";
import {
    workspaces,
    nodes,
    edges,
    collections,
    type InsertWorkspace,
    type Workspace,
    type Node,
    type Edge,
    type InsertNode,
    type InsertEdge,
    type Collection,
    type InsertCollection,
} from "@shared/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export interface ICanvasStorage {
    // Collections
    getCollections(userId: string, parentId?: number | null): Promise<Collection[]>;
    createCollection(collection: InsertCollection): Promise<Collection>;

    // Workspaces
    getWorkspaces(userId: string, collectionId?: number | null): Promise<Workspace[]>;
    getWorkspace(id: number): Promise<Workspace | undefined>;
    createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
    updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace>;
    deleteWorkspace(id: number): Promise<void>;

    // Canvas operations
    getNodes(workspaceId: number): Promise<Node[]>;
    getEdges(workspaceId: number): Promise<Edge[]>;
    syncCanvas(workspaceId: number, nodes: InsertNode[], edges: InsertEdge[]): Promise<void>;
}

export class CanvasDatabaseStorage implements ICanvasStorage {
    async getCollections(userId: string, parentId: number | null = null): Promise<Collection[]> {
        const query = parentId
            ? and(eq(collections.userId, userId), eq(collections.parentId, parentId))
            : and(eq(collections.userId, userId), isNull(collections.parentId));

        return await db.select()
            .from(collections)
            .where(query);
    }

    async createCollection(insertCollection: InsertCollection): Promise<Collection> {
        const [collection] = await db.insert(collections).values(insertCollection).returning();
        return collection;
    }

    async getWorkspaces(userId: string, collectionId: number | null = null): Promise<Workspace[]> {
        const query = collectionId
            ? and(eq(workspaces.userId, userId), eq(workspaces.collectionId, collectionId))
            : and(eq(workspaces.userId, userId), isNull(workspaces.collectionId));

        return await db.select()
            .from(workspaces)
            .where(query)
            .orderBy(desc(workspaces.createdAt));
    }

    async getWorkspace(id: number): Promise<Workspace | undefined> {
        const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
        return workspace;
    }

    async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
        const [workspace] = await db.insert(workspaces).values(insertWorkspace).returning();
        return workspace;
    }

    async updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace> {
        const [workspace] = await db.update(workspaces).set(updates).where(eq(workspaces.id, id)).returning();
        return workspace;
    }

    async deleteWorkspace(id: number): Promise<void> {
        await db.transaction(async (tx: any) => {
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
        await db.transaction(async (tx: any) => {
            await tx.delete(edges).where(eq(edges.workspaceId, workspaceId));
            await tx.delete(nodes).where(eq(nodes.workspaceId, workspaceId));
            if (newNodes.length > 0) {
                await tx.insert(nodes).values(newNodes.map(n => ({ ...n, workspaceId })));
            }
            if (newEdges.length > 0) {
                await tx.insert(edges).values(newEdges.map(e => ({ ...e, workspaceId })));
            }
        });
    }
}

// In-memory fallback for Canvas
export class CanvasMemStorage implements ICanvasStorage {
    private workspacesMap: Map<number, Workspace> = new Map();
    private collectionsMap: Map<number, Collection> = new Map();
    private nodesMap: Map<string, Node> = new Map();
    private edgesMap: Map<string, Edge> = new Map();
    private currentId: number = 1;

    async getCollections(userId: string, parentId: number | null = null): Promise<Collection[]> {
        return Array.from(this.collectionsMap.values()).filter(c => c.userId === userId && c.parentId === parentId);
    }

    async createCollection(insertCollection: InsertCollection): Promise<Collection> {
        const id = this.currentId++;
        const collection: Collection = {
            ...insertCollection,
            id,
            createdAt: new Date(),
            userId: insertCollection.userId ?? null,
            description: insertCollection.description ?? null,
            parentId: insertCollection.parentId ?? null
        };
        this.collectionsMap.set(id, collection);
        return collection;
    }

    async getWorkspaces(userId: string, collectionId: number | null = null): Promise<Workspace[]> {
        return Array.from(this.workspacesMap.values())
            .filter(w => w.userId === userId && w.collectionId === collectionId)
            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    }

    async getWorkspace(id: number): Promise<Workspace | undefined> {
        return this.workspacesMap.get(id);
    }

    async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
        const id = this.currentId++;
        const workspace: Workspace = {
            ...insertWorkspace,
            id,
            createdAt: new Date(),
            type: insertWorkspace.type ?? "system",
            collectionId: insertWorkspace.collectionId ?? null,
            userId: insertWorkspace.userId ?? null
        };
        this.workspacesMap.set(id, workspace);
        return workspace;
    }

    async updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace> {
        const existing = this.workspacesMap.get(id);
        if (!existing) throw new Error("Workspace not found");
        const updated = { ...existing, ...updates };
        this.workspacesMap.set(id, updated);
        return updated;
    }

    async deleteWorkspace(id: number): Promise<void> {
        this.workspacesMap.delete(id);
        for (const [nodeId, node] of Array.from(this.nodesMap.entries())) {
            if (node.workspaceId === id) this.nodesMap.delete(nodeId);
        }
        for (const [edgeId, edge] of Array.from(this.edgesMap.entries())) {
            if (edge.workspaceId === id) this.edgesMap.delete(edgeId);
        }
    }

    async getNodes(workspaceId: number): Promise<Node[]> {
        return Array.from(this.nodesMap.values()).filter(n => n.workspaceId === workspaceId);
    }

    async getEdges(workspaceId: number): Promise<Edge[]> {
        return Array.from(this.edgesMap.values()).filter(e => e.workspaceId === workspaceId);
    }

    async syncCanvas(workspaceId: number, newNodes: InsertNode[], newEdges: InsertEdge[]): Promise<void> {
        for (const [id, node] of Array.from(this.nodesMap.entries())) {
            if (node.workspaceId === workspaceId) this.nodesMap.delete(id);
        }
        for (const [id, edge] of Array.from(this.edgesMap.entries())) {
            if (edge.workspaceId === workspaceId) this.edgesMap.delete(id);
        }
        for (const n of newNodes) {
            this.nodesMap.set(n.id, { ...n, workspaceId } as Node);
        }
        for (const e of newEdges) {
            this.edgesMap.set(e.id, { ...e, workspaceId } as Edge);
        }
    }
}

export const canvasStorage = process.env.CANVAS_DATABASE_URL || process.env.DATABASE_URL
    ? new CanvasDatabaseStorage()
    : new CanvasMemStorage();
