"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, Heart, Search, Settings2, Sparkles } from "lucide-react";
import { getFavorites, getRecent, getDemoUser, clearDemoUser } from "@/lib/client-storage";
import { tools } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import ToolIcon from "@/components/ToolIcon";

export default function DashboardClient() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => { setFavorites(getFavorites()); setRecent(getRecent()); setUser(getDemoUser()); };
    sync(); window.addEventListener("toolhub:storage", sync);
    return () => window.removeEventListener("toolhub:storage", sync);
  }, []);
  const favoriteTools = favorites.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  const recentTools = recent.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool));

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div><span className="eyebrow">YOUR TOOLHUB</span><h1>Welcome{user ? `, ${user}` : " back"}.</h1><p>What would you like to get done today?</p></div>
        <Link className="primary-button" href="/tools"><Search size={17}/> Explore tools</Link>
      </div>
      <div className="dashboard-search-prompt"><Search size={19}/><Link href="/tools">Find a tool for your next task...</Link><ArrowRight size={17}/></div>
      <section className="dashboard-section">
        <div className="section-heading"><div><h2><Clock3 size={19}/> Recently used</h2><p>Pick up where you left off.</p></div><Link href="/tools">Explore all <ArrowRight size={15}/></Link></div>
        {recentTools.length ? <div className="tool-grid compact-grid">{recentTools.slice(0, 4).map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div> : <div className="inline-empty"><span className="empty-icon"><Clock3 size={20}/></span><div><strong>No recent tools yet</strong><p>Tools you open will appear here.</p></div><Link href="/tools">Browse tools <ArrowRight size={14}/></Link></div>}
      </section>
      <section className="dashboard-section">
        <div className="section-heading"><div><h2><Heart size={19}/> Favorites</h2><p>Your saved shortcuts, all in one place.</p></div><span className="muted-count">{favoriteTools.length} saved</span></div>
        {favoriteTools.length ? <div className="tool-grid compact-grid">{favoriteTools.slice(0, 4).map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div> : <div className="inline-empty"><span className="empty-icon"><Heart size={20}/></span><div><strong>Your favorites will live here</strong><p>Use the star on any tool to save it for later.</p></div><Link href="/tools">Find tools <ArrowRight size={14}/></Link></div>}
      </section>
      <section className="workspace-promo"><div className="promo-icon"><Sparkles size={21}/></div><div><strong>Keep your workflow simple.</strong><p>Save your most-used tools and build a personal workspace as you go.</p></div><Link href="/tools">Find a tool <ArrowRight size={15}/></Link></section>
      <div className="dashboard-footnote"><Settings2 size={14}/> Prototype mode: favorites and recent tools are saved in this browser only. <button onClick={() => {clearDemoUser();setUser(null);}}>Sign out demo</button></div>
    </div>
  );
}
