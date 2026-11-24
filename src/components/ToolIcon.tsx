import type { LucideProps } from "lucide-react";
import { resolveToolIcon } from "@/lib/tool-icons";

export default function ToolIcon({ name, size = 22, ...props }: { name: string; size?: number } & LucideProps) {
  const Icon = resolveToolIcon(name);
  return <Icon size={size} {...props} />;
}
