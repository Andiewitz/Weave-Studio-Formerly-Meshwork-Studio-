import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { encryptApiKey, decryptApiKey, generateKeyHint } from "./encryption";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("[AI] DATABASE_URL not set");
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

// Types from schema
export type UserApiKey = typeof schema.userApiKeys.$inferSelect;
export type InsertUserApiKey = typeof schema.userApiKeys.$inferInsert;

/**
 * Database operations for user API keys
 * All keys are encrypted before storage and only decrypted when needed
 */

export interface CreateKeyInput {
  userId: string;
  provider: string;
  apiKey: string;
}

export interface KeyWithPlaintext extends UserApiKey {
  plaintextKey: string;
}

/**
 * Create a new encrypted API key for a user
 */
export async function createApiKey(input: CreateKeyInput): Promise<UserApiKey> {
  // Encrypt the API key
  const { encryptedData, iv, authTag } = encryptApiKey(input.apiKey);
  
  // Generate hint for UI
  const keyHint = generateKeyHint(input.apiKey);
  
  const insertData: InsertUserApiKey = {
    userId: input.userId,
    provider: input.provider,
    encryptedKey: encryptedData,
    iv,
    authTag,
    keyHint,
    isActive: true,
  };
  
  const [result] = await db
    .insert(schema.userApiKeys)
    .values(insertData)
    .returning();
  
  return result;
}

/**
 * Get all API keys for a user (without plaintext - safe for UI)
 */
export async function getUserApiKeys(userId: string): Promise<UserApiKey[]> {
  return await db
    .select()
    .from(schema.userApiKeys)
    .where(eq(schema.userApiKeys.userId, userId))
    .orderBy(schema.userApiKeys.createdAt);
}

/**
 * Get active API keys for a user by provider
 * Returns encrypted data - must be decrypted before use
 */
export async function getActiveKeyForProvider(
  userId: string, 
  provider: string
): Promise<UserApiKey | null> {
  const [result] = await db
    .select()
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.userId, userId),
        eq(schema.userApiKeys.provider, provider),
        eq(schema.userApiKeys.isActive, true)
      )
    )
    .limit(1);
  
  return result || null;
}

/**
 * Get a specific API key with decrypted plaintext
 * Use sparingly - only when making actual API calls
 */
export async function getApiKeyWithPlaintext(
  userId: string,
  keyId: string
): Promise<KeyWithPlaintext | null> {
  const [result] = await db
    .select()
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId)
      )
    )
    .limit(1);
  
  if (!result) {
    return null;
  }
  
  // Decrypt the key
  const plaintextKey = decryptApiKey(
    result.encryptedKey,
    result.iv,
    result.authTag
  );
  
  return {
    ...result,
    plaintextKey,
  };
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
  const result = await db
    .delete(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId)
      )
    )
    .returning();
  
  return result.length > 0;
}

/**
 * Toggle key active status
 */
export async function toggleKeyStatus(
  userId: string, 
  keyId: string, 
  isActive: boolean
): Promise<UserApiKey | null> {
  const [result] = await db
    .update(schema.userApiKeys)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(schema.userApiKeys.id, keyId),
        eq(schema.userApiKeys.userId, userId)
      )
    )
    .returning();
  
  return result || null;
}

/**
 * Check if user has any keys for a provider
 */
export async function hasKeyForProvider(
  userId: string, 
  provider: string
): Promise<boolean> {
  const result = await db
    .select({ count: schema.userApiKeys.id })
    .from(schema.userApiKeys)
    .where(
      and(
        eq(schema.userApiKeys.userId, userId),
        eq(schema.userApiKeys.provider, provider),
        eq(schema.userApiKeys.isActive, true)
      )
    )
    .limit(1);
  
  return result.length > 0;
}
