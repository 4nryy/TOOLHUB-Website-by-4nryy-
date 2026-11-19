import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";
export const metadata: Metadata = { title: "Your Workspace — TOOLHUB" };
export default function DashboardPage() { return <main className="content-shell dashboard-shell"><DashboardClient/></main>; }
