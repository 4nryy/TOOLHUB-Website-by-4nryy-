import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";
import FavoriteToggle from "@/components/FavoriteToggle";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="tool-card">
      <div className="tool-card-top">
        <div className={`tool-icon icon-${tool.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}><ToolIcon name={tool.icon} size={22}/></div>
        <div className="tool-card-actions">
          {tool.popular && <span className="tiny-badge"><Sparkles size={11}/> Popular</span>}
          <FavoriteToggle slug={tool.slug} compact />
        </div>
      </div>
      <Link href={`/tools/${tool.slug}`} className="tool-card-title">{tool.name}<ArrowUpRight size={16}/></Link>
      <p>{tool.description}</p>
      <div className="tool-card-meta"><span>{tool.category}</span><span className="local-label"><span/> {tool.processing}</span></div>
    </article>
  );
}
