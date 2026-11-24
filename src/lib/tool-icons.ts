/**
 * Icon registry for tools and categories. Pure module (no JSX), so it can be unit-tested directly.
 * Names are stable keys stored in src/lib/tools.ts; the lucide component is looked up here.
 */
import {
  Binary, Braces, Briefcase, Calculator, CalendarDays, Clock3, Code2, File as FileIcon, FileText, Files,
  Fingerprint, Image, Percent, QrCode, ReceiptText, Timer, Type, Wrench,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<LucideProps>;

const iconMap: Record<string, IconComponent> = {
  "file-text": FileText, type: Type, braces: Braces, binary: Binary,
  fingerprint: Fingerprint, "qr-code": QrCode, image: Image, files: Files,
  percent: Percent, "calendar-days": CalendarDays, timer: Timer,
  "receipt-text": ReceiptText, code: Code2, calculator: Calculator,
  clock: Clock3, wrench: Wrench,
  // Task 2B Phase 1: these two category icons were missing and fell back to Wrench.
  file: FileIcon, briefcase: Briefcase,
};

/** True only for names that are real keys of the icon map (own properties, so "constructor" is false). */
export function hasToolIcon(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(iconMap, name);
}

/** Returns the icon for a name, or Wrench for an unknown name. */
export function resolveToolIcon(name: string): IconComponent {
  return hasToolIcon(name) ? iconMap[name] : Wrench;
}

/** CSS class that colours a category's tool icon, e.g. "Text & Writing" -> "icon-text-writing" (must exist in globals.css). */
export function categoryIconClass(category: string): string {
  return `icon-${category.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}
