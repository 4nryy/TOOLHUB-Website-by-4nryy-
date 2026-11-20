import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "TOOLHUB — Smart tools. Greater productivity.",
  description: "Simple, useful tools for work, study, and everyday tasks.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><TopNav/>{children}<footer className="site-footer"><div className="footer-brand"><span className="brand-mark small"><span>◇</span></span><strong>TOOLHUB</strong></div><span>Smart tools. Greater productivity.</span><div className="footer-links"><a href="/tools">Tools</a><a href="/dashboard">Workspace</a><a href="mailto:hello@toolhub.local">Contact</a></div><span className="copyright">© {new Date().getFullYear()} TOOLHUB</span></footer></body></html>;
}
