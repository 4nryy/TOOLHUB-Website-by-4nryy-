"use client";

const FAVORITES_KEY = "toolhub:favorites";
const RECENT_KEY = "toolhub:recent";
const USER_KEY = "toolhub:demo-user";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

export function getFavorites() { return readList(FAVORITES_KEY); }
export function toggleFavorite(slug: string) {
  const current = getFavorites();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("toolhub:storage"));
  return next;
}
export function getRecent() { return readList(RECENT_KEY); }
export function recordRecent(slug: string) {
  const next = [slug, ...getRecent().filter((item) => item !== slug)].slice(0, 8);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("toolhub:storage"));
}
export function getDemoUser(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}
export function setDemoUser(name: string) {
  window.localStorage.setItem(USER_KEY, name);
  window.dispatchEvent(new Event("toolhub:storage"));
}
export function clearDemoUser() {
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("toolhub:storage"));
}
