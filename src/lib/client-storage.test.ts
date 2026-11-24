import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_NOTICE, clearDemoUser, getDegradedNotices, getDemoUser, getFavorites, getRecent, getStorageStatus,
  recordRecent, resetClientStorageState, setDemoUser, toggleFavorite,
} from "./client-storage";

// Storage keys are a persisted-data contract: renaming them silently drops users' favorites.
const FAVORITES_KEY = "toolhub:favorites";
const RECENT_KEY = "toolhub:recent";
const USER_KEY = "toolhub:demo-user";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.has(key) ? (this.data.get(key) as string) : null; }
  setItem(key: string, value: string): void { this.data.set(key, String(value)); }
  removeItem(key: string): void { this.data.delete(key); }
}

function installWindow(storage: MemoryStorage = new MemoryStorage()) {
  resetClientStorageState();
  const events: string[] = [];
  const fake = { localStorage: storage, dispatchEvent: (event: Event) => { events.push(event.type); return true; } };
  (globalThis as { window?: unknown }).window = fake;
  return { storage, events };
}
function removeWindow() { delete (globalThis as { window?: unknown }).window; }

describe("client-storage — server side (no window)", () => {
  beforeEach(removeWindow);
  it("reads return empty values instead of throwing", () => {
    assert.deepEqual(getFavorites(), []);
    assert.deepEqual(getRecent(), []);
    assert.equal(getDemoUser(), null);
  });
});

describe("client-storage — favorites", () => {
  let ctx: ReturnType<typeof installWindow>;
  beforeEach(() => { ctx = installWindow(); });
  afterEach(removeWindow);

  it("starts empty", () => assert.deepEqual(getFavorites(), []));
  it("adds a favorite at the front (newest first) and persists it as JSON", () => {
    toggleFavorite("a");
    assert.deepEqual(toggleFavorite("b"), ["b", "a"]);
    assert.deepEqual(JSON.parse(ctx.storage.getItem(FAVORITES_KEY) as string), ["b", "a"]);
  });
  it("removes a favorite when toggled twice", () => {
    toggleFavorite("a");
    assert.deepEqual(toggleFavorite("a"), []);
    assert.deepEqual(getFavorites(), []);
  });
  it("notifies listeners with the 'toolhub:storage' event on every change", () => {
    toggleFavorite("a");
    toggleFavorite("a");
    assert.deepEqual(ctx.events, ["toolhub:storage", "toolhub:storage"]);
  });
  it("recovers from corrupted JSON", () => {
    ctx.storage.setItem(FAVORITES_KEY, "{not json");
    assert.deepEqual(getFavorites(), []);
  });
  it("ignores stored values that are not arrays", () => {
    for (const raw of ['{"a":1}', "null", '"text"', "42"]) {
      ctx.storage.setItem(FAVORITES_KEY, raw);
      assert.deepEqual(getFavorites(), [], raw);
    }
  });
  it("keeps only string entries from a mixed array", () => {
    ctx.storage.setItem(FAVORITES_KEY, '["a",1,null,"b",{"x":1}]');
    assert.deepEqual(getFavorites(), ["a", "b"]);
  });
  it("returns [] when reading storage throws (e.g. blocked storage)", () => {
    class BlockedRead extends MemoryStorage { getItem(): string | null { throw new Error("blocked"); } }
    installWindow(new BlockedRead());
    assert.deepEqual(getFavorites(), []);
  });
});

describe("client-storage — recently used", () => {
  let ctx: ReturnType<typeof installWindow>;
  beforeEach(() => { ctx = installWindow(); });
  afterEach(removeWindow);

  it("records the newest tool first", () => {
    recordRecent("a");
    recordRecent("b");
    assert.deepEqual(getRecent(), ["b", "a"]);
  });
  it("moves a repeated tool to the front without duplicating it", () => {
    recordRecent("a"); recordRecent("b"); recordRecent("a");
    assert.deepEqual(getRecent(), ["a", "b"]);
  });
  it("keeps at most 8 entries, dropping the oldest", () => {
    for (let i = 1; i <= 10; i++) recordRecent(`s${i}`);
    assert.deepEqual(getRecent(), ["s10", "s9", "s8", "s7", "s6", "s5", "s4", "s3"]);
  });
  it("persists under the expected key and notifies listeners", () => {
    recordRecent("a");
    assert.deepEqual(JSON.parse(ctx.storage.getItem(RECENT_KEY) as string), ["a"]);
    assert.deepEqual(ctx.events, ["toolhub:storage"]);
  });
});

describe("client-storage — demo user", () => {
  let ctx: ReturnType<typeof installWindow>;
  beforeEach(() => { ctx = installWindow(); });
  afterEach(removeWindow);

  it("is null before sign-in", () => assert.equal(getDemoUser(), null));
  it("stores and returns the display name, then clears it", () => {
    setDemoUser("Rina");
    assert.equal(getDemoUser(), "Rina");
    assert.equal(ctx.storage.getItem(USER_KEY), "Rina");
    clearDemoUser();
    assert.equal(getDemoUser(), null);
  });
  it("notifies listeners on set and clear", () => {
    setDemoUser("Rina");
    clearDemoUser();
    assert.deepEqual(ctx.events, ["toolhub:storage", "toolhub:storage"]);
  });
});

class ThrowingWrite extends MemoryStorage { setItem(): void { throw new Error("QuotaExceededError"); } }
class ThrowingRemove extends MemoryStorage { removeItem(): void { throw new Error("SecurityError"); } }

/** A window whose localStorage getter throws, as when the browser blocks site storage. */
function installBrokenWindow() {
  const fake = { dispatchEvent: () => true };
  Object.defineProperty(fake, "localStorage", { get: () => { throw new Error("SecurityError: storage blocked"); } });
  (globalThis as { window?: unknown }).window = fake;
}

describe("client-storage — write failures keep the page working (Task 2B Phase 1)", () => {
  beforeEach(() => resetClientStorageState());
  afterEach(removeWindow);

  it("toggleFavorite does not throw when the write fails and returns the updated list", () => {
    installWindow(new ThrowingWrite());
    assert.deepEqual(toggleFavorite("a"), ["a"]);
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(toggleFavorite("a"), []);
  });
  it("a failed favorite write is reported as degraded and nothing reaches storage", () => {
    const ctx = installWindow(new ThrowingWrite());
    toggleFavorite("a");
    assert.equal(getStorageStatus(), "degraded");
    assert.equal(ctx.storage.getItem(FAVORITES_KEY), null);
  });
  it("recordRecent does not throw when the write fails", () => {
    installWindow(new ThrowingWrite());
    assert.doesNotThrow(() => recordRecent("a"));
    assert.deepEqual(getRecent(), ["a"]);
    assert.equal(getStorageStatus(), "degraded");
  });
  it("setDemoUser does not throw when the write fails and the name is kept for this session", () => {
    installWindow(new ThrowingWrite());
    assert.doesNotThrow(() => setDemoUser("Rina"));
    assert.equal(getDemoUser(), "Rina");
  });
  it("clearDemoUser does not throw when removal fails and the user is signed out for this session", () => {
    const ctx = installWindow(new ThrowingRemove());
    ctx.storage.setItem(USER_KEY, "Rina");
    assert.doesNotThrow(() => clearDemoUser());
    assert.equal(getDemoUser(), null);
    assert.equal(getStorageStatus(), "degraded");
  });
  it("every write still notifies listeners exactly once, even when it fails", () => {
    const ctx = installWindow(new ThrowingWrite());
    toggleFavorite("a");
    recordRecent("b");
    setDemoUser("x");
    assert.deepEqual(ctx.events, ["toolhub:storage", "toolhub:storage", "toolhub:storage"]);
  });
  it("a later successful write replaces the session copy and status returns to ok", () => {
    installWindow(new ThrowingWrite());
    toggleFavorite("a");
    assert.equal(getStorageStatus(), "degraded");
    const working = new MemoryStorage();
    (globalThis as { window?: { localStorage?: unknown } }).window!.localStorage = working;
    assert.deepEqual(toggleFavorite("b"), ["b", "a"]);
    assert.deepEqual(getFavorites(), ["b", "a"]);
    assert.equal(getStorageStatus(), "ok");
    assert.deepEqual(JSON.parse(working.getItem(FAVORITES_KEY) as string), ["b", "a"]);
  });
});

describe("client-storage — storage unavailable (Task 2B Phase 1)", () => {
  beforeEach(() => resetClientStorageState());
  afterEach(removeWindow);

  it("reads are empty and do not throw when access to localStorage is blocked", () => {
    installBrokenWindow();
    assert.equal(getDemoUser(), null);
    assert.deepEqual(getFavorites(), []);
    assert.deepEqual(getRecent(), []);
    assert.equal(getStorageStatus(), "degraded");
  });
  it("writes do not throw when access to localStorage is blocked and still work for this session", () => {
    installBrokenWindow();
    assert.doesNotThrow(() => {
      toggleFavorite("a");
      recordRecent("b");
      setDemoUser("Rina");
    });
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(getRecent(), ["b"]);
    assert.equal(getDemoUser(), "Rina");
    assert.equal(getStorageStatus(), "degraded");
  });
  it("works when the window has no localStorage property at all", () => {
    (globalThis as { window?: unknown }).window = { dispatchEvent: () => true };
    assert.equal(getDemoUser(), null);
    assert.doesNotThrow(() => recordRecent("a"));
    assert.deepEqual(getRecent(), ["a"]);
    assert.equal(getStorageStatus(), "degraded");
  });
  it("clearDemoUser does not throw when storage is blocked", () => {
    installBrokenWindow();
    assert.doesNotThrow(() => clearDemoUser());
    assert.equal(getDemoUser(), null);
  });
  it("status is ok when storage works and nothing failed", () => {
    installWindow(new MemoryStorage());
    getFavorites();
    assert.equal(getStorageStatus(), "ok");
  });
});

/** Storage where individual keys can be made to fail on write or read (for per-kind scenarios). */
class KeyedStorage extends MemoryStorage {
  failWrite = new Set<string>();
  failRead = new Set<string>();
  setItem(key: string, value: string): void {
    if (this.failWrite.has(key)) throw new Error("QuotaExceededError");
    super.setItem(key, value);
  }
  getItem(key: string): string | null {
    if (this.failRead.has(key)) throw new Error("SecurityError");
    return super.getItem(key);
  }
}

describe("client-storage — status per data kind (Task 2B Phase 1 review)", () => {
  beforeEach(() => resetClientStorageState());
  afterEach(removeWindow);

  it("scenario 1: favorites fail to save, recent tools save", () => {
    const storage = new KeyedStorage();
    storage.failWrite.add(FAVORITES_KEY);
    installWindow(storage);
    toggleFavorite("a");
    recordRecent("b");
    assert.equal(getStorageStatus("favorites"), "degraded");
    assert.equal(getStorageStatus("recent"), "ok");
    assert.equal(getStorageStatus("demo-user"), "ok");
    assert.equal(getStorageStatus(), "degraded");
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(getRecent(), ["b"]);
    assert.deepEqual(getDegradedNotices(), [STORAGE_NOTICE.favorites]);
  });

  it("scenario 2: recent tools fail to save, favorites save", () => {
    const storage = new KeyedStorage();
    storage.failWrite.add(RECENT_KEY);
    installWindow(storage);
    toggleFavorite("a");
    recordRecent("b");
    assert.equal(getStorageStatus("recent"), "degraded");
    assert.equal(getStorageStatus("favorites"), "ok");
    assert.equal(getStorageStatus("demo-user"), "ok");
    assert.equal(getStorageStatus(), "degraded");
    assert.deepEqual(getRecent(), ["b"]);
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(getDegradedNotices(), [STORAGE_NOTICE.recent]);
  });

  it("scenario 3: demo user fails to save, favorites and recent save", () => {
    const storage = new KeyedStorage();
    storage.failWrite.add(USER_KEY);
    installWindow(storage);
    toggleFavorite("a");
    recordRecent("b");
    setDemoUser("Rina");
    assert.equal(getStorageStatus("demo-user"), "degraded");
    assert.equal(getStorageStatus("favorites"), "ok");
    assert.equal(getStorageStatus("recent"), "ok");
    assert.equal(getDemoUser(), "Rina");
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(getRecent(), ["b"]);
    assert.deepEqual(getDegradedNotices(), [STORAGE_NOTICE["demo-user"]]);
  });

  it("scenario 4a: every kind fails to save", () => {
    const storage = new KeyedStorage();
    for (const key of [FAVORITES_KEY, RECENT_KEY, USER_KEY]) storage.failWrite.add(key);
    installWindow(storage);
    toggleFavorite("a");
    recordRecent("b");
    setDemoUser("Rina");
    for (const kind of ["favorites", "recent", "demo-user"] as const) assert.equal(getStorageStatus(kind), "degraded", kind);
    assert.equal(getStorageStatus(), "degraded");
    assert.deepEqual(getDegradedNotices(), [STORAGE_NOTICE.favorites, STORAGE_NOTICE.recent, STORAGE_NOTICE["demo-user"]]);
    assert.deepEqual(getFavorites(), ["a"]);
    assert.deepEqual(getRecent(), ["b"]);
    assert.equal(getDemoUser(), "Rina");
  });

  it("scenario 4b: storage is blocked entirely, so every kind reads empty and is degraded", () => {
    installBrokenWindow();
    assert.deepEqual(getFavorites(), []);
    assert.deepEqual(getRecent(), []);
    assert.equal(getDemoUser(), null);
    for (const kind of ["favorites", "recent", "demo-user"] as const) assert.equal(getStorageStatus(kind), "degraded", kind);
    assert.equal(getDegradedNotices().length, 3);
  });

  it("scenario 5: storage recovers and each kind's status is updated correctly", () => {
    const storage = new KeyedStorage();
    storage.failWrite.add(FAVORITES_KEY);
    storage.failRead.add(RECENT_KEY);
    installWindow(storage);
    toggleFavorite("a");
    assert.deepEqual(getRecent(), []);
    assert.equal(getStorageStatus("favorites"), "degraded");
    assert.equal(getStorageStatus("recent"), "degraded");

    // Storage works again.
    storage.failWrite.clear();
    storage.failRead.clear();
    assert.deepEqual(getRecent(), []);
    assert.equal(getStorageStatus("recent"), "ok", "a successful read of recent clears only recent");
    // Favorites exist only in memory until they are written again, so they stay degraded (no false "saved").
    assert.equal(getStorageStatus("favorites"), "degraded");
    assert.deepEqual(getFavorites(), ["a"]);

    assert.deepEqual(toggleFavorite("b"), ["b", "a"]);
    assert.equal(getStorageStatus("favorites"), "ok");
    assert.equal(getStorageStatus(), "ok");
    assert.deepEqual(JSON.parse(storage.getItem(FAVORITES_KEY) as string), ["b", "a"]);
    assert.deepEqual(getDegradedNotices(), []);
  });

  it("a read failure of one key is not cleared by successful reads of other keys", () => {
    const storage = new KeyedStorage();
    storage.failRead.add(FAVORITES_KEY);
    installWindow(storage);
    assert.deepEqual(getFavorites(), []);
    assert.deepEqual(getRecent(), []);
    assert.equal(getDemoUser(), null);
    assert.equal(getStorageStatus("favorites"), "degraded");
    assert.equal(getStorageStatus("recent"), "ok");
    assert.equal(getStorageStatus("demo-user"), "ok");
    assert.deepEqual(getDegradedNotices(), [STORAGE_NOTICE.favorites]);

    storage.failRead.clear();
    assert.deepEqual(getFavorites(), []);
    assert.equal(getStorageStatus("favorites"), "ok");
  });

  it("a successful write of a key clears that key's earlier read failure without another read", () => {
    const storage = new KeyedStorage();
    storage.failRead.add(USER_KEY);
    installWindow(storage);
    assert.equal(getDemoUser(), null);
    assert.equal(getStorageStatus("demo-user"), "degraded");
    storage.failRead.clear();
    setDemoUser("Rina");
    assert.equal(getStorageStatus("demo-user"), "ok");
    assert.deepEqual(getDegradedNotices(), []);
  });

  it("no notice and status ok when every kind works", () => {
    installWindow(new MemoryStorage());
    getFavorites();
    getRecent();
    getDemoUser();
    assert.deepEqual(getDegradedNotices(), []);
    assert.equal(getStorageStatus(), "ok");
  });
});
