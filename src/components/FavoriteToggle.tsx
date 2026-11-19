"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getFavorites, toggleFavorite } from "@/lib/client-storage";

export default function FavoriteToggle({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(getFavorites().includes(slug));
    sync();
    window.addEventListener("toolhub:storage", sync);
    return () => window.removeEventListener("toolhub:storage", sync);
  }, [slug]);

  function onToggle() {
    const next = toggleFavorite(slug);
    setSaved(next.includes(slug));
  }

  return (
    <button className={compact ? `icon-button favorite-icon ${saved ? "saved" : ""}` : `favorite-button ${saved ? "saved" : ""}`} type="button" onClick={onToggle} aria-label={saved ? "Remove from favorites" : "Add to favorites"} title={saved ? "Remove from favorites" : "Add to favorites"}>
      <Star size={compact ? 17 : 18} fill={saved ? "currentColor" : "none"}/>
      {!compact && <span>{saved ? "Added to Favorites" : "Add to Favorites"}</span>}
    </button>
  );
}
