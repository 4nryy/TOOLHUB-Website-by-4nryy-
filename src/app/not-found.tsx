import Link from "next/link";
export default function NotFound() { return <main className="not-found"><span className="eyebrow">404 · NOT FOUND</span><h1>This tool doesn't exist.</h1><p>It may have moved, or the link may be incorrect.</p><Link className="primary-button" href="/tools">Browse all tools</Link></main>; }
