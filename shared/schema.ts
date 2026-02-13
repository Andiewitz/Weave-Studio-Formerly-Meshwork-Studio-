import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("system"), // system, architecture, app, presentation
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nodes = pgTable("nodes", {
  id: text("id").primaryKey(), // React Flow uses string IDs
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  type: text("type"),
  position: jsonb("position").$type<{ x: number, y: number }>().notNull(),
  data: jsonb("data").$type<any>().notNull(),
  parentId: text("parent_id"),
  extent: text("extent"), // 'parent' or undefined
});

export const edges = pgTable("edges", {
  id: text("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
  sourceHandle: text("source_handle"),
  targetHandle: text("target_handle"),
  type: text("type"),
  data: jsonb("data").$type<any>(),
  animated: integer("animated").default(0), // 0 or 1
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true });
export const insertNodeSchema = createInsertSchema(nodes);
export const insertEdgeSchema = createInsertSchema(edges);

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;
export type Edge = typeof edges.$inferSelect;
export type InsertEdge = z.infer<typeof insertEdgeSchema>;

export type CreateWorkspaceRequest = InsertWorkspace;
export type UpdateWorkspaceRequest = Partial<InsertWorkspace>;
export type WorkspaceResponse = Workspace;

