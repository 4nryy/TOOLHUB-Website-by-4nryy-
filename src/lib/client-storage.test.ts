import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clearDemoUser, getDemoUser, getFavorites, getRecent, recordRecent, setDemoUser, toggleFavorite,
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

describe("client-storage — KNOWN ISSUES (current behavior, may change in Task 2)", () => {
  afterEach(removeWindow);
  it("write errors (quota exceeded / private mode) are NOT caught and propagate to the UI handler", () => {
    class BlockedWrite extends MemoryStorage { setItem(): void { throw new Error("QuotaExceededError"); } }
    installWindow(new BlockedWrite());
    assert.throws(() => toggleFavorite("a"), /QuotaExceededError/);
    assert.throws(() => recordRecent("a"), /QuotaExceededError/);
    assert.throws(() => setDemoUser("x"), /QuotaExceededError/);
  });
});
