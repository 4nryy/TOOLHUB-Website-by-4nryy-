"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, ChevronDown, Globe2, Search, UserCircle2 } from "lucide-react";
import { getDemoUser } from "@/lib/client-storage";

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sync = () => setUser(getDemoUser());
    sync();
    window.addEventListener("toolhub:storage", sync);
    return () => window.removeEventListener("toolhub:storage", sync);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="TOOLHUB home">
          <span className="brand-mark"><Box size={23} strokeWidth={2.7} /></span>
          <span>TOOLHUB</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={pathname.startsWith("/tools") ? "nav-link active" : "nav-link"} href="/tools">Tools <ChevronDown size={15}/></Link>
          <a className="nav-link" href="/#categories">Categories <ChevronDown size={15}/></a>
          <Link className={pathname.startsWith("/dashboard") ? "nav-link active" : "nav-link"} href="/dashboard">Workspace</Link>
        </nav>
        <form className="nav-search" action="/tools">
          <Search size={18}/>
          <input aria-label="Search tools" name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." />
        </form>
        <div className="nav-actions">
          <button className="language-button" type="button" aria-label="Language currently English"><Globe2 size={18}/> <span>EN</span><ChevronDown size={14}/></button>
          {user ? <Link href="/dashboard" className="account-link"><UserCircle2 size={18}/><span>{user}</span></Link> : <Link href="/login" className="sign-in-button">Sign in</Link>}
        </div>
      </div>
    </header>
  );
}
