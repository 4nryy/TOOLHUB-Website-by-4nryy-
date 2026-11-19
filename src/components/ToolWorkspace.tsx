"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowDownToLine, Check, CheckCircle2, Clipboard, Download,
  FileUp, Info, LoaderCircle, Play, RotateCcw, Sparkles, TimerReset,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import type { Tool } from "@/lib/tools";
import { recordRecent } from "@/lib/client-storage";
import FavoriteToggle from "@/components/FavoriteToggle";
import ToolIcon from "@/components/ToolIcon";

type Props = { tool: Tool };

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function base64Encode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function base64Decode(value: string) {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ToolWorkspace({ tool }: Props) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState("uppercase");
  const [base, setBase] = useState("100");
  const [percent, setPercent] = useState("15");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [uuidCount, setUuidCount] = useState("1");
  const [qrData, setQrData] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("toolhub-result.txt");
  const [busy, setBusy] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedInfo, setCompressedInfo] = useState("");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [customer, setCustomer] = useState("");
  const [invoiceItem, setInvoiceItem] = useState("Service");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("150000");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { recordRecent(tool.slug); }, [tool.slug]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) { setRunning(false); setNotice(timerMode === "focus" ? "Focus session complete. Take a short break." : "Break complete. Ready for another focus session?"); return 0; }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [running, timerMode]);

  const wordStats = useMemo(() => {
    const trimmed = input.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length : 0;
    return { words, characters: input.length, noSpaces: input.replace(/\s/g, "").length, sentences, reading: words ? Math.max(1, Math.ceil(words / 200)) : 0 };
  }, [input]);
  const invoiceTotal = Math.max(0, Number(quantity) || 0) * Math.max(0, Number(unitPrice) || 0);

  function resetOutput() {
    setResult(""); setError(""); setNotice(""); setDownloadUrl(""); setImagePreview(""); setCompressedInfo(""); setQrData("");
  }
  function runTextTool() {
    setError(""); setNotice(""); setDownloadUrl("");
    try {
      let output = "";
      if (tool.slug === "text-formatter") {
        if (mode === "uppercase") output = input.toUpperCase();
        else if (mode === "lowercase") output = input.toLowerCase();
        else if (mode === "title") output = input.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
        else if (mode === "sentence") output = input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (letter) => letter.toUpperCase());
        else if (mode === "trim") output = input.split("\n").map((line) => line.trim()).join("\n").replace(/[ \t]{2,}/g, " ");
        else output = input.trim().replace(/\s+/g, " ");
      } else if (tool.slug === "json-formatter") {
        const parsed = JSON.parse(input);
        output = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, Number(mode) || 2);
        setNotice("Valid JSON. Your result is ready.");
      } else if (tool.slug === "base64-encoder") {
        output = mode === "decode" ? base64Decode(input) : base64Encode(input);
      }
      setResult(output);
    } catch (cause) {
      setResult("");
      setError(cause instanceof Error ? cause.message : "Unable to process this input.");
    }
  }

  async function runAction() {
    resetOutput(); setBusy(true);
    try {
      if (tool.slug === "uuid-generator") {
        const count = Math.min(100, Math.max(1, Number(uuidCount) || 1));
        const ids = Array.from({ length: count }, () => crypto.randomUUID());
        setResult(ids.join("\n")); setDownloadName("toolhub-uuids.txt");
      } else if (tool.slug === "qr-generator") {
        if (!input.trim()) throw new Error("Enter text or a link to create a QR code.");
        const dataUrl = await QRCode.toDataURL(input.trim(), { width: 460, margin: 2, color: { dark: "#172554", light: "#ffffff" } });
        setQrData(dataUrl); setNotice("QR code generated in your browser.");
      } else if (tool.slug === "image-compressor") {
        const file = selectedFiles[0];
        if (!file) throw new Error("Choose an image to compress first.");
        if (!file.type.startsWith("image/")) throw new Error("Please choose a supported image file.");
        const originalUrl = URL.createObjectURL(file);
        const image = new window.Image();
        image.src = originalUrl;
        await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not read this image.")); });
        const canvas = document.createElement("canvas");
        const maxDimension = 2400;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not process this image.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image compression failed.")), "image/jpeg", 0.78));
        URL.revokeObjectURL(originalUrl);
        const url = URL.createObjectURL(blob);
        setImagePreview(url); setDownloadUrl(url); setDownloadName(`${file.name.replace(/\.[^.]+$/, "")}-compressed.jpg`);
        setCompressedInfo(`${formatBytes(file.size)} → ${formatBytes(blob.size)} (${file.size ? Math.max(0, Math.round((1 - blob.size / file.size) * 100)) : 0}% smaller)`);
        setNotice("Image compressed locally in your browser.");
      } else if (tool.slug === "pdf-merger") {
        if (selectedFiles.length < 2) throw new Error("Choose at least two PDF files to merge.");
        const merged = await PDFDocument.create();
        for (const file of selectedFiles) {
          const bytes = await file.arrayBuffer();
          const source = await PDFDocument.load(bytes);
          const pages = await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }
        const bytes = await merged.save();
        const blob = new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url); setDownloadName("toolhub-merged.pdf");
        setResult(`${selectedFiles.length} PDF files combined successfully.`);
        setNotice("Your files were merged locally in your browser.");
      } else if (tool.slug === "percentage-calculator") {
        const b = Number(base), p = Number(percent);
        if (!Number.isFinite(b) || !Number.isFinite(p)) throw new Error("Enter valid numbers in both fields.");
        setResult(`${p}% of ${b} = ${(b * p / 100).toLocaleString(undefined, { maximumFractionDigits: 6 })}`);
      } else if (tool.slug === "date-calculator") {
        if (!startDate || !endDate) throw new Error("Choose both dates first.");
        const start = new Date(`${startDate}T00:00:00Z`), end = new Date(`${endDate}T00:00:00Z`);
        const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
        setResult(`${Math.abs(diff).toLocaleString()} days${diff < 0 ? " (the end date is before the start date)" : ""}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  async function copyResult() {
    const text = result || (tool.slug === "qr-generator" ? qrData : "");
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setNotice("Copied to clipboard."); }
    catch { setError("Clipboard access is unavailable in this browser."); }
  }

  function downloadText() {
    if (!result) return;
    saveBlob(new Blob([result], { type: "text/plain;charset=utf-8" }), downloadName);
  }

  const isTextTool = ["word-counter", "text-formatter", "json-formatter", "base64-encoder"].includes(tool.slug);
  const formatTool = tool.slug === "text-formatter" || tool.slug === "json-formatter" || tool.slug === "base64-encoder";

  return (
    <main className="workspace-page">
      <div className="workspace-back"><Link href="/tools">← Back to Tools</Link></div>
      <section className="workspace-heading">
        <div className="workspace-tool-icon"><ToolIcon name={tool.icon} size={39}/></div>
        <div className="workspace-title-block">
          <div className="workspace-title-line"><h1>{tool.name}</h1><span className="free-badge">Free</span></div>
          <p>{tool.description}</p>
          <div className="workspace-tags"><span className="category-pill">{tool.category}</span><span className="processing-pill"><span/> Processed in your browser</span></div>
        </div>
        <FavoriteToggle slug={tool.slug}/>
      </section>

      <section className="workspace-content">
        {isTextTool && <div className="editor-grid">
          <div className="editor-panel">
            <div className="panel-heading"><strong>Input</strong><span className="panel-muted">Your text stays on this device</span></div>
            <textarea className="code-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={tool.slug === "json-formatter" ? 'Paste your JSON here...\n\nExample: { "name": "TOOLHUB" }' : tool.slug === "base64-encoder" ? "Enter text here..." : "Enter or paste your text here..."} spellCheck={false}/>
            <div className="editor-footer"><span>{input.length.toLocaleString()} characters</span>{tool.slug === "word-counter" && <span>{wordStats.words} words</span>}</div>
          </div>
          <div className="result-panel">
            <div className="panel-heading"><strong><CheckCircle2 size={18}/> Result</strong>{result && <button className="text-button" onClick={() => setResult("")}>Clear</button>}</div>
            {tool.slug === "word-counter" ? <div className="word-stats"><div><span>Words</span><strong>{wordStats.words.toLocaleString()}</strong></div><div><span>Characters</span><strong>{wordStats.characters.toLocaleString()}</strong></div><div><span>No spaces</span><strong>{wordStats.noSpaces.toLocaleString()}</strong></div><div><span>Sentences</span><strong>{wordStats.sentences.toLocaleString()}</strong></div><div><span>Reading time</span><strong>{wordStats.reading} min</strong></div></div> : result ? <pre className="result-text">{result}</pre> : <div className="result-placeholder"><div className="placeholder-glyph"><ToolIcon name={tool.icon} size={38}/></div><strong>Your result will appear here</strong><span>Enter your content and click the button below.</span></div>}
            {error && <div className="error-message"><AlertCircle size={15}/>{error}</div>}
            {notice && <div className="success-message"><Check size={15}/>{notice}</div>}
            {result && <div className="result-actions"><button className="secondary-button" onClick={copyResult}><Clipboard size={15}/> Copy</button><button className="secondary-button" onClick={downloadText}><Download size={15}/> Download .txt</button></div>}
          </div>
        </div>}

        

        {formatTool && <div className="workspace-controls">
          <label className="field-label">{tool.slug === "json-formatter" ? "Format options" : tool.slug === "base64-encoder" ? "Action" : "Text style"}
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {tool.slug === "json-formatter" ? <><option value="2">Pretty print (2 spaces)</option><option value="4">Pretty print (4 spaces)</option><option value="minify">Minify JSON</option></> : tool.slug === "base64-encoder" ? <><option value="encode">Encode to Base64</option><option value="decode">Decode Base64</option></> : <><option value="uppercase">UPPERCASE</option><option value="lowercase">lowercase</option><option value="title">Title Case</option><option value="sentence">Sentence case</option><option value="trim">Trim each line</option><option value="spaces">Normalize spaces</option></>}
            </select>
          </label>
          <button className="primary-button process-button" onClick={runTextTool} disabled={!input.trim()}><Play size={16} fill="currentColor"/> {tool.slug === "json-formatter" ? "Format JSON" : tool.slug === "base64-encoder" ? (mode === "decode" ? "Decode" : "Encode") : "Format Text"}</button>
        </div>}

        {tool.slug === "uuid-generator" && <div className="simple-tool-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Generate UUIDs</h2><p>Create unique identifiers locally in your browser.</p></div></div><label className="field-label small-field">Number of UUIDs<select value={uuidCount} onChange={(e) => setUuidCount(e.target.value)}>{[1,2,5,10,25,50,100].map((n) => <option key={n} value={n}>{n}</option>)}</select></label><button className="primary-button" onClick={runAction} disabled={busy}><Play size={16} fill="currentColor"/> Generate UUID</button><OutputBox result={result} error={error} notice={notice} onCopy={copyResult} onDownload={downloadText}/></div>}

        {tool.slug === "qr-generator" && <div className="simple-tool-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Create a QR code</h2><p>Enter a website address, text, or other information.</p></div></div><label className="field-label">Text or URL<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com"/></label><button className="primary-button" onClick={runAction} disabled={busy || !input.trim()}>{busy ? <LoaderCircle className="spin" size={16}/> : <Play size={16} fill="currentColor"/>} Generate QR code</button>{error && <div className="error-message"><AlertCircle size={15}/>{error}</div>}{notice && <div className="success-message"><Check size={15}/>{notice}</div>}{qrData && <div className="qr-result"><img src={qrData} alt="Generated QR code"/><button className="secondary-button" onClick={() => {const a=document.createElement("a");a.href=qrData;a.download="toolhub-qr.png";a.click();}}><Download size={15}/> Download PNG</button></div>}</div>}

        {tool.slug === "image-compressor" && <div className="simple-tool-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Compress an image</h2><p>Images are processed locally. Output is JPEG, maximum dimension 2400 px.</p></div></div><label className="upload-zone"><FileUp size={29}/><strong>{selectedFiles[0]?.name || "Choose an image"}</strong><span>{selectedFiles[0] ? formatBytes(selectedFiles[0].size) : "JPG, PNG, WebP or other browser-supported formats"}</span><input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {setSelectedFiles(e.target.files ? [e.target.files[0]] : []);resetOutput();}}/></label><button className="primary-button" onClick={runAction} disabled={busy || !selectedFiles.length}>{busy ? <LoaderCircle className="spin" size={16}/> : <Play size={16} fill="currentColor"/>} Compress image</button>{error && <div className="error-message"><AlertCircle size={15}/>{error}</div>}{notice && <div className="success-message"><Check size={15}/>{notice}</div>}{imagePreview && <div className="image-result"><img src={imagePreview} alt="Compressed output preview"/><div><strong>Compressed image ready</strong><p>{compressedInfo}</p><a className="secondary-button inline-action" href={downloadUrl} download={downloadName}><Download size={15}/> Download image</a></div></div>}</div>}

        {tool.slug === "pdf-merger" && <div className="simple-tool-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Combine PDF files</h2><p>Select at least two PDFs. The selected order will be kept.</p></div></div><label className="upload-zone"><FileUp size={29}/><strong>{selectedFiles.length ? `${selectedFiles.length} PDF files selected` : "Choose PDF files"}</strong><span>{selectedFiles.length ? selectedFiles.map((file) => file.name).join(" · ") : "Select multiple PDF documents"}</span><input type="file" accept="application/pdf,.pdf" multiple onChange={(e) => {setSelectedFiles(e.target.files ? Array.from(e.target.files) : []);resetOutput();}}/></label><button className="primary-button" onClick={runAction} disabled={busy || selectedFiles.length < 2}>{busy ? <LoaderCircle className="spin" size={16}/> : <Play size={16} fill="currentColor"/>} Merge PDFs</button>{error && <div className="error-message"><AlertCircle size={15}/>{error}</div>}{notice && <div className="success-message"><Check size={15}/>{notice}</div>}{result && <div className="file-result"><CheckCircle2 size={22}/><div><strong>{result}</strong><p>Your combined PDF is ready.</p></div><a className="secondary-button inline-action" href={downloadUrl} download={downloadName}><Download size={15}/> Download PDF</a></div>}</div>}

        {tool.slug === "percentage-calculator" && <div className="simple-tool-card calculator-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Calculate a percentage</h2><p>Find what percentage of a number is.</p></div></div><div className="two-fields"><label className="field-label">Percentage (%)<input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="15"/></label><label className="field-label">Of number<input type="number" value={base} onChange={(e) => setBase(e.target.value)} placeholder="100"/></label></div><button className="primary-button" onClick={runAction}><Play size={16} fill="currentColor"/> Calculate</button><OutputBox result={result} error={error} notice={notice} onCopy={copyResult}/></div>}

        {tool.slug === "date-calculator" && <div className="simple-tool-card calculator-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Calculate date difference</h2><p>Count the number of calendar days between two dates.</p></div></div><div className="two-fields"><label className="field-label">Start date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/></label><label className="field-label">End date<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/></label></div><button className="primary-button" onClick={runAction}><Play size={16} fill="currentColor"/> Calculate difference</button><OutputBox result={result} error={error} notice={notice} onCopy={copyResult}/></div>}

        {tool.slug === "pomodoro-timer" && <div className="simple-tool-card pomodoro-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Focus timer</h2><p>Work in a focused session, then take a short break.</p></div></div><div className="timer-switch"><button className={timerMode === "focus" ? "selected" : ""} onClick={() => {setTimerMode("focus");setSeconds(25*60);setRunning(false);}}>Focus · 25 min</button><button className={timerMode === "break" ? "selected" : ""} onClick={() => {setTimerMode("break");setSeconds(5*60);setRunning(false);}}>Short break · 5 min</button></div><div className="timer-face"><span>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</span><small>{timerMode === "focus" ? "TIME TO FOCUS" : "TAKE A BREATH"}</small></div><div className="timer-actions"><button className="primary-button" onClick={() => {setNotice("");setRunning(!running);}}><Play size={16} fill="currentColor"/>{running ? "Pause" : "Start"}</button><button className="secondary-button" onClick={() => {setRunning(false);setSeconds(timerMode === "focus" ? 25*60 : 5*60);setNotice("");}}><TimerReset size={16}/> Reset</button></div>{notice && <div className="success-message"><Check size={15}/>{notice}</div>}</div>}

        {tool.slug === "invoice-generator" && <div className="simple-tool-card invoice-card"><div className="simple-tool-head"><div className="simple-tool-icon"><ToolIcon name={tool.icon} size={27}/></div><div><h2>Create an invoice</h2><p>Fill in the details and print or save your invoice as PDF.</p></div></div><div className="invoice-form"><label className="field-label">Customer name<input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer or company"/></label><label className="field-label">Description<input value={invoiceItem} onChange={(e) => setInvoiceItem(e.target.value)} placeholder="Product or service"/></label><div className="two-fields"><label className="field-label">Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}/></label><label className="field-label">Unit price (IDR)<input type="number" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}/></label></div></div><div className="invoice-preview"><div className="invoice-preview-head"><strong>INVOICE</strong><span>TOOLHUB</span></div><p>Bill to: <strong>{customer || "Customer name"}</strong></p><div className="invoice-line"><span>{invoiceItem || "Item description"} × {quantity || 0}</span><strong>{invoiceTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</strong></div><div className="invoice-total"><span>Total</span><strong>{invoiceTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</strong></div></div><button className="primary-button" onClick={() => window.print()}><Download size={16}/> Print / Save as PDF</button><p className="field-hint">Use your browser's print dialog and choose “Save as PDF”.</p></div>}
      </section>

      <div className="tool-tip"><Info size={18}/><p><strong>Tip:</strong> {tipFor(tool.slug)}</p><span className="privacy-note"><CheckCircle2 size={14}/> Your data stays in this browser</span></div>
      <section className="below-workspace"><h2>About this tool</h2><p>{tool.description} TOOLHUB keeps the main action easy to find. Optional settings are kept out of the way until you need them.</p><div className="privacy-card"><Sparkles size={18}/><div><strong>Privacy first</strong><p>This tool runs in your browser. Your input is not uploaded to TOOLHUB servers in this prototype.</p></div></div></section>
    </main>
  );
}

function OutputBox({ result, error, notice, onCopy, onDownload }: { result: string; error: string; notice: string; onCopy: () => void; onDownload?: () => void }) {
  return <div className="generic-output">{error && <div className="error-message"><AlertCircle size={15}/>{error}</div>}{notice && <div className="success-message"><Check size={15}/>{notice}</div>}{result && <><pre>{result}</pre><div className="result-actions"><button className="secondary-button" onClick={onCopy}><Clipboard size={15}/> Copy</button>{onDownload && <button className="secondary-button" onClick={onDownload}><Download size={15}/> Download</button>}</div></>}</div>;
}
function tipFor(slug: string) {
  const tips: Record<string, string> = {
    "word-counter": "A quick word count can help you check the length of an essay, report, or post.",
    "text-formatter": "Choose a text style, then format your text with one click.",
    "json-formatter": 'A valid JSON example: { "name": "TOOLHUB" }',
    "base64-encoder": "Base64 is an encoding format, not encryption. Do not use it to protect secrets.",
    "uuid-generator": "UUIDs are commonly used as unique identifiers in software projects.",
    "qr-generator": "Check your QR code with a scanner before sharing it.",
    "image-compressor": "Compressed output is saved as JPEG. Keep your original image if you need transparency.",
    "pdf-merger": "The order of selected files determines the order in the merged PDF.",
    "percentage-calculator": "To find 15% of 200, enter 15 and 200.",
    "date-calculator": "The date difference counts full calendar days and does not include both endpoints.",
    "pomodoro-timer": "Try one focus session, then take a short break before continuing.",
    "invoice-generator": "Review customer and payment details before sending an invoice."
  };
  return tips[slug] || "Choose the options you need and run the tool.";
}
