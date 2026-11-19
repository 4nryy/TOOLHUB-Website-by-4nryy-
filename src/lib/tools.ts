export type ToolCategory = "Text & Writing" | "Developer" | "Image & Media" | "Documents" | "Calculator" | "Student & Work" | "Business";
export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  processing: "Local" | "Hybrid";
  popular?: boolean;
  keywords: string[];
};

export const categories: { name: ToolCategory; description: string; icon: string }[] = [
  { name: "Text & Writing", description: "Format, count, and refine text", icon: "type" },
  { name: "Developer", description: "Small utilities for everyday coding", icon: "code" },
  { name: "Image & Media", description: "Work with images and visual files", icon: "image" },
  { name: "Documents", description: "Manage and prepare documents", icon: "file" },
  { name: "Calculator", description: "Quick everyday calculations", icon: "calculator" },
  { name: "Student & Work", description: "Stay focused and organized", icon: "clock" },
  { name: "Business", description: "Simple tools for daily operations", icon: "briefcase" }
];

export const tools: Tool[] = [
  { slug: "word-counter", name: "Word Counter", description: "Count words, characters, and reading time.", category: "Text & Writing", icon: "file-text", processing: "Local", popular: true, keywords: ["word", "character", "count", "writing"] },
  { slug: "text-formatter", name: "Text Formatter", description: "Clean up text and change letter case.", category: "Text & Writing", icon: "type", processing: "Local", keywords: ["uppercase", "lowercase", "clean", "case"] },
  { slug: "json-formatter", name: "JSON Formatter", description: "Format, minify, and validate JSON data.", category: "Developer", icon: "braces", processing: "Local", popular: true, keywords: ["json", "pretty print", "validate", "developer"] },
  { slug: "base64-encoder", name: "Base64 Encoder / Decoder", description: "Encode text to Base64 or decode it back.", category: "Developer", icon: "binary", processing: "Local", keywords: ["base64", "encode", "decode"] },
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate unique identifiers instantly.", category: "Developer", icon: "fingerprint", processing: "Local", keywords: ["uuid", "guid", "identifier", "random"] },
  { slug: "qr-generator", name: "QR Code Generator", description: "Create a QR code from text or a link.", category: "Image & Media", icon: "qr-code", processing: "Local", popular: true, keywords: ["qr", "barcode", "scan", "link"] },
  { slug: "image-compressor", name: "Image Compressor", description: "Reduce image file size in your browser.", category: "Image & Media", icon: "image", processing: "Local", keywords: ["compress", "resize", "jpg", "png"] },
  { slug: "pdf-merger", name: "PDF Merger", description: "Combine multiple PDF files into one.", category: "Documents", icon: "files", processing: "Local", keywords: ["pdf", "merge", "combine"] },
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Find a percentage or calculate a change.", category: "Calculator", icon: "percent", processing: "Local", popular: true, keywords: ["percent", "discount", "math"] },
  { slug: "date-calculator", name: "Date Calculator", description: "Calculate the difference between two dates.", category: "Calculator", icon: "calendar-days", processing: "Local", keywords: ["date", "days", "duration"] },
  { slug: "pomodoro-timer", name: "Pomodoro Timer", description: "Focus with simple work and break sessions.", category: "Student & Work", icon: "timer", processing: "Local", keywords: ["pomodoro", "focus", "study", "timer"] },
  { slug: "invoice-generator", name: "Invoice Generator", description: "Create a clean invoice preview for your work.", category: "Business", icon: "receipt-text", processing: "Local", keywords: ["invoice", "bill", "business", "payment"] }
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
