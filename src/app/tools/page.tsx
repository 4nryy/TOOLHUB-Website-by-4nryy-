import type { Metadata } from "next";
import ToolExplorer from "@/components/ToolExplorer";
import { categories, type ToolCategory } from "@/lib/tools";

export const metadata: Metadata = { title: "Explore Tools — TOOLHUB" };
type SearchParams = Promise<{ q?: string; category?: string }>;
export default async function ToolsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = categories.some((item) => item.name === params.category) ? params.category as ToolCategory : "All tools";
  return <main className="directory-page content-shell"><div className="page-intro"><span className="eyebrow">TOOL DIRECTORY</span><h1>Find the tool you need.</h1><p>Browse simple utilities for your everyday tasks.</p></div><ToolExplorer initialQuery={params.q || ""} initialCategory={category}/></main>;
}
