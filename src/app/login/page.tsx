"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Info, UserCircle2 } from "lucide-react";
import { setDemoUser } from "@/lib/client-storage";

export default function LoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  function enterDemo(e: FormEvent) { e.preventDefault(); const safeName = name.trim().slice(0, 30); if (!safeName) return; setDemoUser(safeName); router.push("/dashboard"); }
  return <main className="auth-page"><form className="auth-card" onSubmit={enterDemo}><div className="auth-icon"><UserCircle2 size={27}/></div><span className="eyebrow">WELCOME TO TOOLHUB</span><h1>Sign in</h1><p>Use a local demo profile to explore the personal workspace.</p><label className="field-label">Display name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={30} required/></label><button className="primary-button auth-submit" type="submit">Continue <ArrowRight size={16}/></button><div className="notice-card"><Info size={17}/><span>This is a frontend prototype. This demo profile is stored only in this browser and is <strong>not</strong> secure authentication. Real accounts will be connected to the backend later.</span></div><Link href="/tools" className="back-link">Continue as guest</Link></form></main>;
}
