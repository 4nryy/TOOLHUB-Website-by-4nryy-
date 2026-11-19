import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Search, Sparkles, Zap } from "lucide-react";
import { categories, tools } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import ToolIcon from "@/components/ToolIcon";

export default function HomePage() {
  const popular = tools.filter((tool) => tool.popular).slice(0, 4);
  return <main>
    <section className="hero-section">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> ALL YOUR ESSENTIAL TOOLS, IN ONE PLACE</div><h1>Less switching.<br/><span>More getting done.</span></h1><p>Simple tools for work, study, and everyday tasks. Find what you need and get straight to it.</p><form className="hero-search" action="/tools"><Search size={20}/><input name="q" placeholder="What do you need to do?" aria-label="Search tools"/><button type="submit">Find a tool <ArrowRight size={16}/></button></form><div className="hero-trust"><span><CheckCircle2 size={15}/> Free tools to get started</span><span><Zap size={15}/> Fast and simple</span><span><CheckCircle2 size={15}/> Browser-first privacy</span></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-main-card"><div className="visual-card-top"><span className="mini-logo">◇</span><span>TOOLHUB</span><span className="visual-live">READY</span></div><div className="visual-main-symbol"><span>{"{ }"}</span></div><strong>One place for everyday tasks</strong><p>Small tools. Clear workflow.</p><div className="visual-mini-grid"><span><b>TXT</b> Text</span><span><b>{"{ }"}</b> Developer</span><span><b>PDF</b> Documents</span></div></div><div className="float-chip chip-top"><span className="chip-icon"><CheckCircle2 size={17}/></span><span><b>Quick to use</b><small>No clutter</small></span></div><div className="float-chip chip-bottom"><span className="chip-icon purple"><Sparkles size={17}/></span><span><b>12 useful tools</b><small>Ready to explore</small></span></div></div>
    </section>

    <section className="content-section popular-section"><div className="section-heading"><div><span className="eyebrow">GET STARTED</span><h2>Popular tools</h2><p>Useful tools, ready when you need them.</p></div><Link href="/tools" className="section-link">Explore all tools <ArrowRight size={16}/></Link></div><div className="tool-grid">{popular.map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div></section>

    <section id="categories" className="content-section categories-section"><div className="section-heading"><div><span className="eyebrow">BROWSE BY PURPOSE</span><h2>Find the right tool</h2><p>Start with a category. Keep the workflow simple.</p></div><Link href="/tools" className="section-link">All categories <ArrowRight size={16}/></Link></div><div className="category-grid">{categories.map((category) => <Link key={category.name} href={`/tools?category=${encodeURIComponent(category.name)}`} className="category-card"><span className="category-icon"><ToolIcon name={category.icon}/></span><span className="category-card-text"><strong>{category.name}</strong><small>{category.description}</small></span><ArrowUpRight size={17}/></Link>)}</div></section>

    <section className="simple-cta"><div className="cta-symbol"><Sparkles size={23}/></div><div><h2>Keep your go-to tools together.</h2><p>Save favorites in your browser and return to them whenever you need.</p></div><Link href="/dashboard" className="secondary-button">Open workspace <ArrowRight size={15}/></Link></section>
  </main>;
}
