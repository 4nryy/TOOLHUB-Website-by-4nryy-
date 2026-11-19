import { NextResponse } from "next/server";
import { tools } from "@/lib/tools";
export async function GET() { return NextResponse.json({ data: tools, count: tools.length }); }
