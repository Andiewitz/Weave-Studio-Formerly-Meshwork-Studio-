import { pgTable, text, serial, timestamp, integer, jsonb, varchar, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - updated for new auth system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // New auth fields
  passwordHash: varchar("password_hash"), // For email/password users
  authProvider: varchar("auth_provider").notNull().default("email"), // "email" | "google"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userApiKeys = pgTable("user_api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider").notNull(), // 'openai', 'anthropic', 'google'
  encryptedKey: text("encrypted_key").notNull(), // AES-256-GCM encrypted
  iv: text("iv").notNull(), // Initialization vector (base64)
  authTag: text("auth_tag").notNull(), // GCM auth tag (base64)
  keyHint: varchar("key_hint", { length: 10 }), // Last 4 chars for UI display
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_user_api_keys_user_id").on(table.userId),
  index("IDX_user_api_keys_provider").on(table.provider),
]);

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: text("user_id"), // Decoupled from users table for multi-db support
  parentId: integer("parent_id"), // for nested collections
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("system"), // system, architecture, app, presentation
  icon: text("icon").default("box"), // icon identifier for the workspace
  userId: text("user_id"), // Decoupled from users table for multi-db support
  collectionId: integer("collection_id").references(() => collections.id),
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

export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true });
// Custom validation for workspace title
const titleRegex = /^[a-zA-Z0-9\-_\s]+$/; // Alphanumeric, spaces, hyphens, underscores only
// Emoji detection - using surrogate pair ranges for ES5 compatibility
const hasEmojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|[\u3297\u3299][\ufe0f]?|[\u303d\u3030\u2b55\u2b50\u2b1c\u2b1b\u23f3\u23f0\u231b\u231a\u21aa\u2199\u2198\u2197\u2196\u2195\u2194\u2139\u2122\u2049\u203c\u3030]|[\u2600-\u26FF][\ufe0f]?|[\u2700-\u27BF][\ufe0f]?)/;

export const insertWorkspaceSchema = createInsertSchema(workspaces, {
  title: z.string()
    .min(1, "Title is required")
    .max(16, "Title must be 16 characters or less")
    .refine((val) => !hasEmojiRegex.test(val), {
      message: "Title cannot contain emojis",
    })
    .refine((val) => titleRegex.test(val) || val.trim().length > 0, {
      message: "Title can only contain letters, numbers, spaces, hyphens, and underscores",
    }),
}).omit({ id: true, createdAt: true });
export const insertNodeSchema = createInsertSchema(nodes);
export const insertUserApiKeySchema = createInsertSchema(userApiKeys).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEdgeSchema = createInsertSchema(edges);

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type InsertUserApiKey = z.infer<typeof insertUserApiKeySchema>;
export type Edge = typeof edges.$inferSelect;
export type InsertEdge = z.infer<typeof insertEdgeSchema>;

export type CreateWorkspaceRequest = InsertWorkspace;
export type UpdateWorkspaceRequest = Partial<InsertWorkspace>;
export type WorkspaceResponse = Workspace;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
