"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getFavorites, getStorageStatus, STORAGE_NOTICE, toggleFavorite } from "@/lib/client-storage";

/** Checks only the favorites kind: a problem with other data never changes this button. */
export default function FavoriteToggle({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  useEffect(() => {
    const sync = () => {
      setSaved(getFavorites().includes(slug));
      setSessionOnly(getStorageStatus("favorites") === "degraded");
    };
    sync();
    window.addEventListener("toolhub:storage", sync);
    return () => window.removeEventListener("toolhub:storage", sync);
  }, [slug]);

  function onToggle() {
    const next = toggleFavorite(slug);
    setSaved(next.includes(slug));
    setSessionOnly(getStorageStatus("favorites") === "degraded");
  }

  const baseLabel = saved ? "Remove from favorites" : "Add to favorites";
  const label = sessionOnly ? `${baseLabel}. ${STORAGE_NOTICE.favorites}` : baseLabel;

  return (
    <button className={compact ? `icon-button favorite-icon ${saved ? "saved" : ""}` : `favorite-button ${saved ? "saved" : ""}`} type="button" onClick={onToggle} aria-label={label} title={label}>
      <Star size={compact ? 17 : 18} fill={saved ? "currentColor" : "none"}/>
      {!compact && <span>{saved ? "Added to Favorites" : "Add to Favorites"}</span>}
      {!compact && sessionOnly && <small>Session only</small>}
    </button>
  );
}
