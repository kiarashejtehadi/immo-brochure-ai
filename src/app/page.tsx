"use client";

import { useCallback, useRef, useState } from "react";
import { prepareImagesForApi } from "@/lib/prepare-images";
import { downloadExposePdf } from "@/lib/download-expose-pdf";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Balcony",
  "Fitted Kitchen",
  "Elevator",
  "Renovated",
] as const;

const TONES = ["Luxurious", "Professional", "Friendly"] as const;

type Tone = (typeof TONES)[number];
type Feature = (typeof FEATURES)[number];
type OutputTab = "expose" | "instagram";

type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text.trim()}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      )}
    >
      {copied ? "Copied!" : (label ?? "Copy to Clipboard")}
    </button>
  );
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [rooms, setRooms] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tone, setTone] = useState<Tone>("Professional");

  const [outputTab, setOutputTab] = useState<OutputTab>("expose");
  const [exposeText, setExposeText] = useState("");
  const [instagramCaptions, setInstagramCaptions] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const addPhotos = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (incoming.length === 0) return;

    setPhotos((prev) => {
      const remaining = 3 - prev.length;
      const toAdd = incoming.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
  }, []);

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function toggleFeature(feature: Feature) {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerateError(null);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

    try {
      const images = await prepareImagesForApi(photos.map((p) => p.file));

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          address,
          price,
          size,
          rooms,
          features,
          tone,
          images,
        }),
      });

      const raw = await response.text();
      let data: {
        expose?: string;
        instagramCaptions?: string[];
        error?: string;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Invalid response from server"
            : `Server error (${response.status}). Restart npm run dev and try again.`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? `Generation failed (${response.status})`);
      }

      if (!data.expose?.trim()) {
        throw new Error("Empty exposé returned from API");
      }

      const captions = (data.instagramCaptions ?? []).filter(Boolean);
      if (captions.length < 2) {
        throw new Error("Expected two Instagram captions from API");
      }

      setExposeText(data.expose);
      setInstagramCaptions(captions.slice(0, 2));
      setHasGenerated(true);
      setOutputTab("expose");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out after 90 seconds. Try again with fewer photos or check your network."
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setGenerateError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!exposeText.trim()) return;
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadExposePdf({
        address,
        price,
        size,
        rooms,
        features,
        tone,
        exposeText,
        photoFiles: photos.map((p) => p.file),
      });
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "PDF could not be created",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
              ImmoCaption AI
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              Exposé & caption studio
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-2 lg:items-start">
        {/* Left: inputs */}
        <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Property details
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Upload up to 3 photos and fill in the listing basics.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Photos (max 3)
            </label>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (photos.length < 3) addPhotos(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
                dragOver
                  ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
                photos.length >= 3 && "pointer-events-none opacity-50",
              )}
            >
              <p className="text-sm font-medium">Drop images here or browse</p>
              <p className="mt-1 text-xs text-zinc-500">
                {photos.length}/3 selected · JPG, PNG, WebP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            {photos.length > 0 && (
              <ul className="mt-3 grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      className="absolute top-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Musterstraße 12, 10115 Berlin"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Price (€)
              </label>
              <input
                id="price"
                type="number"
                min={0}
                placeholder="450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label
                htmlFor="size"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Size (m²)
              </label>
              <input
                id="size"
                type="number"
                min={0}
                placeholder="85"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="rooms"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Number of rooms
              </label>
              <input
                id="rooms"
                type="number"
                min={0}
                step={0.5}
                placeholder="3"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Features
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((feature) => {
                const active = features.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                    )}
                  >
                    {feature}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tone
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-sm font-medium transition",
                    tone === option
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {generateError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
              {generateError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {isGenerating ? "Generating…" : "Generate Exposé & Captions"}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={
              !exposeText.trim() || isDownloadingPdf || isGenerating
            }
            className={cn(
              "w-full rounded-xl border-2 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              exposeText.trim()
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
            )}
          >
            {isDownloadingPdf
              ? "Preparing PDF…"
              : "Download PDF Exposé"}
          </button>
          {!exposeText.trim() && (
            <p className="text-center text-xs text-zinc-500">
              PDF download unlocks after you generate the exposé.
            </p>
          )}
        </section>

        {/* Right: outputs */}
        <section
          ref={previewRef}
          className="flex min-h-[32rem] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-200 px-4 pt-4 dark:border-zinc-800">
            <h2 className="px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Preview
            </h2>
            <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setOutputTab("expose")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition",
                  outputTab === "expose"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
                )}
              >
                Exposé Description
              </button>
              <button
                type="button"
                onClick={() => setOutputTab("instagram")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition",
                  outputTab === "instagram"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
                )}
              >
                Instagram Captions
              </button>
            </div>
            <div className="mt-3 px-2 pb-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={
                  !exposeText.trim() || isDownloadingPdf || isGenerating
                }
                className={cn(
                  "w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
                  exposeText.trim()
                    ? "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    : "border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {isDownloadingPdf
                  ? "Preparing PDF…"
                  : "Download PDF Exposé"}
              </button>
              {!exposeText.trim() ? (
                <p className="mt-2 px-1 text-xs text-zinc-500">
                  Click &quot;Generate Exposé &amp; Captions&quot; first — then
                  this downloads a one-page PDF with photos, specs, and text.
                </p>
              ) : null}
              {pdfError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {pdfError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            {generateError && !isGenerating && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                {generateError}
              </div>
            )}
            {!hasGenerated && !isGenerating && !generateError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No content yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-zinc-500">
                  Complete the form and click Generate to create a formal
                  German exposé (~200 words) and two Instagram captions.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Creating your copy…
                </p>
                <p className="mt-1 max-w-xs text-sm text-zinc-500">
                  This usually takes 5–20 seconds. Large photos are compressed
                  first.
                </p>
              </div>
            ) : !hasGenerated && generateError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Generation failed
                </p>
                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                  Fix the issue above and click Generate again.
                </p>
              </div>
            ) : outputTab === "expose" ? (
              <div className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Exposé
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={exposeText} />
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf || isGenerating}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      {isDownloadingPdf ? "PDF…" : "PDF"}
                    </button>
                  </div>
                </div>
                <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {exposeText}
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {instagramCaptions.map((caption, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-500">
                        Caption {index + 1}
                      </span>
                      <CopyButton text={caption} />
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {caption}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
