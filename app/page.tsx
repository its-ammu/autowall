"use client";

import { useState, useCallback } from "react";

const MODELS = [
  { id: "iphone16promax", name: "iPhone 16 Pro Max" },
  { id: "iphone16pro", name: "iPhone 16 Pro" },
  { id: "iphone16plus", name: "iPhone 16 Plus" },
  { id: "iphone16", name: "iPhone 16" },
  { id: "iphone15promax", name: "iPhone 15 Pro Max" },
  { id: "iphone15pro", name: "iPhone 15 Pro" },
  { id: "iphone15", name: "iPhone 15" },
  { id: "iphone14promax", name: "iPhone 14 Pro Max" },
  { id: "iphone14pro", name: "iPhone 14 Pro" },
  { id: "iphone14", name: "iPhone 14" },
  { id: "iphonese", name: "iPhone SE" },
  { id: "pixel9pro", name: "Pixel 9 Pro" },
  { id: "pixel9", name: "Pixel 9" },
  { id: "pixel8pro", name: "Pixel 8 Pro" },
  { id: "pixel8", name: "Pixel 8" },
  { id: "galaxys24ultra", name: "Galaxy S24 Ultra" },
  { id: "galaxys24", name: "Galaxy S24" },
  { id: "galaxys23ultra", name: "Galaxy S23 Ultra" },
  { id: "galaxys23", name: "Galaxy S23" },
];

const STYLES = [
  { id: "squares", name: "Squares", desc: "Grid of squares" },
  { id: "cloud", name: "Cloud", desc: "Cloud fills by progress" },
  { id: "flowers", name: "Flowers", desc: "Flowers bloom by progress" },
  { id: "ink", name: "Ink", desc: "Calligraphy fills with ink" },
];

const INK_PLACEHOLDER = "Every day is a fresh page. Write something worth reading.";
const INK_MAX_LINES = 3;
const INK_MAX_CHARS = 200;

export default function Home() {
  const [model, setModel] = useState("iphone16pro");
  const [style, setStyle] = useState("squares");
  const [loading, setLoading] = useState(true);
  const [imgKey, setImgKey] = useState(0);
  const [inkText, setInkText] = useState("");
  const [copied, setCopied] = useState(false);

  const inkParam = style === "ink" && inkText.trim()
    ? `&text=${encodeURIComponent(inkText.trim())}`
    : "";
  const wallpaperUrl = `/today?model=${model}&style=${style}${inkParam}`;

  function handleModelChange(newModel: string) {
    setModel(newModel);
    setLoading(true);
    setImgKey((k) => k + 1);
  }

  function handleStyleChange(newStyle: string) {
    setStyle(newStyle);
    setLoading(true);
    setImgKey((k) => k + 1);
  }

  function handleInkTextChange(value: string) {
    const lines = value.split("\n");
    if (lines.length > INK_MAX_LINES) return;
    if (value.length > INK_MAX_CHARS) return;
    setInkText(value);
  }

  function applyInkText() {
    setLoading(true);
    setImgKey((k) => k + 1);
  }

  const copyApiLink = useCallback(() => {
    const fullUrl = `${window.location.origin}${wallpaperUrl}`;
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(onSuccess);
    } else {
      const ta = document.createElement("textarea");
      ta.value = fullUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onSuccess();
    }
  }, [wallpaperUrl]);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 py-12 md:py-20">
      {/* Inspired-by badge — top right */}
      <a
        href="https://thelifecalendar.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-5 right-5 z-50 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-[#E8E3DC] rounded-full px-3.5 py-1.5 text-xs text-[#8A8177] hover:text-[#60463B] hover:border-[#60463B]/30 transition-all shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
        inspired by <span className="font-medium text-[#60463B]">The Life Calendar</span>
      </a>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-[#2D2A26]">auto</span>
          <span className="text-[#60463B]">wall</span>
        </h1>
        <p className="text-[#8A8177] text-lg md:text-xl max-w-md mx-auto">
          Year progress wallpaper for your phone.
          <br />
          See how far you&apos;ve come.
        </p>
      </div>

      {/* Style Pills */}
      <div className="mb-6 w-full max-w-2xl">
        <label className="block text-sm text-[#8A8177] mb-3 font-medium text-center">
          Style
        </label>
        <div className="flex flex-wrap justify-center gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStyleChange(s.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                style === s.id
                  ? "bg-[#60463B] text-white ring-2 ring-[#60463B]/30"
                  : "bg-[#F0EDE8] text-[#6B5D53] hover:bg-[#E8E3DC]"
              }`}
              title={s.desc}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ink custom text */}
      {style === "ink" && (
        <div className="mb-6 w-full max-w-sm">
          <label
            htmlFor="inkText"
            className="block text-sm text-[#8A8177] mb-2 font-medium"
          >
            Your text{" "}
            <span className="text-[#B0A89E] font-normal">
              (max {INK_MAX_LINES} lines)
            </span>
          </label>
          <textarea
            id="inkText"
            value={inkText}
            onChange={(e) => handleInkTextChange(e.target.value)}
            placeholder={INK_PLACEHOLDER}
            rows={3}
            className="w-full bg-white border border-[#DDD6CD] rounded-xl px-4 py-3 text-[#2D2A26] text-base focus:outline-none focus:ring-2 focus:ring-[#60463B]/30 focus:border-[#60463B] transition-all resize-none placeholder:text-[#C4BDB4]"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#B0A89E]">
              {inkText.length}/{INK_MAX_CHARS}
            </span>
            <button
              type="button"
              onClick={applyInkText}
              className="text-sm font-medium text-[#60463B] hover:text-[#4A3530] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Model Selector */}
      <div className="mb-8 w-full max-w-xs">
        <label
          htmlFor="model"
          className="block text-sm text-[#8A8177] mb-2 font-medium"
        >
          Phone Model
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full bg-white border border-[#DDD6CD] rounded-xl px-4 py-3 text-[#2D2A26] text-base focus:outline-none focus:ring-2 focus:ring-[#60463B]/30 focus:border-[#60463B] transition-all appearance-none cursor-pointer"
        >
          <optgroup label="iPhone">
            {MODELS.filter((m) => m.id.startsWith("iphone")).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Pixel">
            {MODELS.filter((m) => m.id.startsWith("pixel")).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Galaxy">
            {MODELS.filter((m) => m.id.startsWith("galaxy")).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Preview */}
      <div className="relative mb-6 w-full max-w-[280px]">
        <div className="rounded-[2.5rem] overflow-hidden border-2 border-[#E8E3DC] shadow-xl shadow-[#60463B]/8 bg-white">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#DDD6CD] border-t-[#60463B] rounded-full animate-spin" />
                <span className="text-[#B0A89E] text-sm">Generating...</span>
              </div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={imgKey}
            src={wallpaperUrl}
            alt="Year progress wallpaper preview"
            className={`w-full h-auto transition-opacity duration-500 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>

      {/* Copy API Link */}
      <div className="mb-8 flex items-center gap-3">
        <a
          href={wallpaperUrl}
          download={`year-progress-${model}-${style}.png`}
          className="inline-flex items-center gap-2 bg-[#60463B] hover:bg-[#4A3530] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-[#60463B]/15"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </a>
        <button
          type="button"
          onClick={copyApiLink}
          className={`inline-flex items-center gap-2 font-medium px-5 py-3.5 rounded-xl border transition-all text-base ${
            copied
              ? "bg-[#60463B]/10 border-[#60463B] text-[#60463B]"
              : "bg-white border-[#DDD6CD] text-[#6B5D53] hover:border-[#60463B]/40 hover:text-[#60463B]"
          }`}
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {copied ? "Copied!" : "Copy API Link"}
        </button>
      </div>

      {/* API Docs */}
      <div className="mt-8 w-full max-w-lg">
        <div className="border border-[#E8E3DC] rounded-2xl p-6 bg-white/70">
          <h2 className="text-lg font-semibold mb-4 text-[#4A3530]">
            API Usage
          </h2>
          <div className="bg-[#F5F2ED] rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
            <span className="text-[#8A8177]">GET</span>{" "}
            <span className="text-[#60463B]">/today</span>
            <span className="text-[#8A8177]">?model=</span>
            <span className="text-[#2D8A5E]">iphone16pro</span>
            <span className="text-[#8A8177]"> &amp; style=</span>
            <span className="text-[#B07D3B]">squares</span>
          </div>
          <p className="text-[#8A8177] text-sm mb-4">
            Returns a PNG wallpaper sized for the phone model. Optional{" "}
            <code className="text-[#60463B] bg-[#F5F2ED] px-1.5 py-0.5 rounded">style</code>: squares, cloud, flowers, ink. For ink, pass{" "}
            <code className="text-[#60463B] bg-[#F5F2ED] px-1.5 py-0.5 rounded">text</code> for custom
            calligraphy content.
          </p>
          <h3 className="text-sm font-semibold text-[#6B5D53] mb-2">
            Supported Models
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#8A8177]">
            {MODELS.map((m) => (
              <div key={m.id} className="font-mono text-xs">
                {m.id}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-[#B0A89E] text-sm text-center">
        improvised by{" "}
        <a
          href="https://portfolio.varsni.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#60463B] hover:text-[#4A3530] transition-colors"
        >
          @varsni
        </a>
      </footer>
    </main>
  );
}
