import {
  Binary, Braces, CalendarDays, Calculator, Clock3, Code2, FileText, Files,
  Fingerprint, Image, Percent, QrCode, ReceiptText, Timer, Type, Wrench,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  "file-text": FileText, type: Type, braces: Braces, binary: Binary,
  fingerprint: Fingerprint, "qr-code": QrCode, image: Image, files: Files,
  percent: Percent, "calendar-days": CalendarDays, timer: Timer,
  "receipt-text": ReceiptText, code: Code2, calculator: Calculator,
  clock: Clock3, wrench: Wrench,
};

export default function ToolIcon({ name, size = 22, ...props }: { name: string; size?: number } & LucideProps) {
  const Icon = iconMap[name] || Wrench;
  return <Icon size={size} {...props} />;
}
