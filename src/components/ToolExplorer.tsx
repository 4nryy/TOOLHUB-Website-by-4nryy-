"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categories, tools, type ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

export default function ToolExplorer({ initialQuery = "", initialCategory = "All tools" }: { initialQuery?: string; initialCategory?: ToolCategory | "All tools" }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ToolCategory | "All tools">(initialCategory);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = category === "All tools" || tool.category === category;
      const haystack = [tool.name, tool.description, tool.category, ...tool.keywords].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [query, category]);

  return (
    <div className="explorer-layout">
      <aside className="category-sidebar">
        <div className="side-heading"><SlidersHorizontal size={16}/> Categories</div>
        <button onClick={() => setCategory("All tools")} className={`category-filter ${category === "All tools" ? "selected" : ""}`}>All tools <span>{tools.length}</span></button>
        {categories.map((item) => <button key={item.name} onClick={() => setCategory(item.name)} className={`category-filter ${category === item.name ? "selected" : ""}`}>{item.name}<span>{tools.filter((tool) => tool.category === item.name).length}</span></button>)}
      </aside>
      <section className="explorer-main">
        <div className="explorer-toolbar">
          <label className="directory-search"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by tool name or what you need..."/><button type="button" onClick={() => setQuery("")} aria-label="Clear search" className={!query ? "hidden" : "clear-search"}><X size={15}/></button></label>
          <span className="result-count">{filtered.length} tools</span>
        </div>
        <div className="tool-grid">
          {filtered.map((tool) => <ToolCard key={tool.slug} tool={tool}/>) }
        </div>
        {filtered.length === 0 && <div className="empty-state"><Search size={28}/><h3>No tools found</h3><p>Try a different keyword or category.</p><button className="secondary-button" onClick={() => {setQuery("");setCategory("All tools");}}>Clear filters</button></div>}
      </section>
    </div>
  );
}
