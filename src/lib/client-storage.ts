"use client";

/**
 * Browser-local storage for favorites, recent tools and the demo user.
 *
 * FAILURE POLICY (Task 2B Phase 1, revised)
 * - Reads never throw. Missing or blocked localStorage reads as empty values.
 * - Writes never throw. If a write fails, the value is kept in memory for the rest of this browser session,
 *   so the current page keeps working. A later successful write for the same key replaces that copy.
 * - Status is tracked PER DATA KIND (favorites, recent, demo-user):
 *     degraded(kind) = the last read of its key failed, OR its latest value is held only in memory.
 *   Each kind is independent: a failure for one kind never changes the status of another, and a successful
 *   read or write of one key never clears a failure recorded for a different key.
 * - getStorageStatus() without an argument is the overall status (degraded if any kind is degraded).
 * - Return values of the existing functions are unchanged. Callers do not need to handle errors.
 * - Nothing here claims that data was saved permanently. Notices say "kept for this session only".
 */

const FAVORITES_KEY = "toolhub:favorites";
const RECENT_KEY = "toolhub:recent";
const USER_KEY = "toolhub:demo-user";

export type StorageKind = "favorites" | "recent" | "demo-user";
export type StorageStatus = "ok" | "degraded";

const KEY_OF: Record<StorageKind, string> = { favorites: FAVORITES_KEY, recent: RECENT_KEY, "demo-user": USER_KEY };
const KINDS = Object.keys(KEY_OF) as StorageKind[];

/** User-facing notice per kind, shown only while that kind is degraded. */
export const STORAGE_NOTICE: Record<StorageKind, string> = {
  favorites: "Favorites are kept for this session only: this browser could not save or read them.",
  recent: "Recent tools are kept for this session only: this browser could not save or read them.",
  "demo-user": "Your demo name is kept for this session only: this browser could not save or read it.",
};

/** Values that could not be written, keyed by storage key. A null value means "removed". */
const sessionFallback = new Map<string, string | null>();
/** Keys whose most recent read failed. Cleared only by a successful read or write of that same key. */
const readFailed = new Set<string>();

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    // Reading window.localStorage itself can throw (for example when the browser blocks site storage).
    return null;
  }
}

function readRaw(key: string): string | null {
  if (sessionFallback.has(key)) return sessionFallback.get(key) ?? null;
  if (typeof window === "undefined") return null;
  const storage = getStorage();
  if (!storage) {
    readFailed.add(key);
    return null;
  }
  try {
    const value = storage.getItem(key);
    readFailed.delete(key);
    return value;
  } catch {
    readFailed.add(key);
    return null;
  }
}

function writeRaw(key: string, value: string | null): void {
  try {
    const storage = getStorage();
    if (!storage) throw new Error("localStorage is not available");
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
    sessionFallback.delete(key);
    readFailed.delete(key);
  } catch {
    sessionFallback.set(key, value);
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("toolhub:storage"));
}

function readList(key: string): string[] {
  try {
    const value = JSON.parse(readRaw(key) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function isDegraded(kind: StorageKind): boolean {
  const key = KEY_OF[kind];
  return readFailed.has(key) || sessionFallback.has(key);
}

export function getFavorites() { return readList(FAVORITES_KEY); }

export function toggleFavorite(slug: string) {
  const current = getFavorites();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current];
  writeRaw(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getRecent() { return readList(RECENT_KEY); }

export function recordRecent(slug: string) {
  const next = [slug, ...getRecent().filter((item) => item !== slug)].slice(0, 8);
  writeRaw(RECENT_KEY, JSON.stringify(next));
}

export function getDemoUser(): string | null {
  return readRaw(USER_KEY);
}

export function setDemoUser(name: string) {
  writeRaw(USER_KEY, name);
}

export function clearDemoUser() {
  writeRaw(USER_KEY, null);
}

/**
 * "degraded" when the given kind (or, without an argument, any kind) could not be read on its last read
 * or currently exists only in memory. Otherwise "ok".
 */
export function getStorageStatus(kind?: StorageKind): StorageStatus {
  const kinds = kind ? [kind] : KINDS;
  return kinds.some(isDegraded) ? "degraded" : "ok";
}

/** Notices for every degraded kind, in a fixed order (favorites, recent, demo-user). Empty when all are ok. */
export function getDegradedNotices(): string[] {
  return KINDS.filter(isDegraded).map((kind) => STORAGE_NOTICE[kind]);
}

/** Test helper: clears the in-memory fallback and read state. The app does not call this. */
export function resetClientStorageState(): void {
  sessionFallback.clear();
  readFailed.clear();
}
