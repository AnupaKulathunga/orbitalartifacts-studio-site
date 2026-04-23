"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export type ManifestEntry = {
  slug: string;
  title: string;
  collection: number;
  sourceUrl: string;
  mediaUrl: string;
  thumbUrl: string;
  imageUrl: string;
  narrative?: string;
  sensor?: string;
  scale?: string;
  acquisitionDate?: string;
  tags?: string[];
};

export type Selections = { startingNumber: number; picks: string[] };

type SaveState = "idle" | "saving" | "saved" | "error";

// Tag values to hide from the region filter — every EaA entry shares these
// so they're useless for narrowing.
const BOILERPLATE_TAGS = new Set([
  "earth as art",
  "Earth Resources Observation and Science (EROS) Center",
  "NLI",
  "Maps and Mapping",
  "Information Systems",
  "Climate",
  "Science of the American Southwest",
]);

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function extractLocationTags(tags?: string[]): string[] {
  return (tags ?? []).filter(
    (t) =>
      !BOILERPLATE_TAGS.has(t) &&
      !/^Earth As Art\s*\d*$/i.test(t) &&
      !/^Landsat/i.test(t) &&
      !/^Sentinel/i.test(t) &&
      !/^ASTER/i.test(t) &&
      !/^Terra/i.test(t),
  );
}

export function CurateClient({
  manifest,
  initialSelections,
}: {
  manifest: ManifestEntry[];
  initialSelections: Selections;
}) {
  const [picks, setPicks] = useState<string[]>(initialSelections.picks);
  const [startingNumber, setStartingNumber] = useState<number>(
    initialSelections.startingNumber,
  );
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<number | null>(null);
  const [sensorFilter, setSensorFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<ManifestEntry | null>(null);

  const bySlug = useMemo(() => {
    const m = new Map<string, ManifestEntry>();
    for (const e of manifest) m.set(e.slug, e);
    return m;
  }, [manifest]);

  const picksSet = useMemo(() => new Set(picks), [picks]);

  const sensors = useMemo(() => {
    const s = new Set<string>();
    for (const e of manifest) if (e.sensor) s.add(e.sensor);
    return [...s].sort();
  }, [manifest]);

  const locationTags = useMemo(() => {
    const t = new Set<string>();
    for (const e of manifest) for (const x of extractLocationTags(e.tags)) t.add(x);
    return [...t].sort();
  }, [manifest]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return manifest.filter((e) => {
      if (collectionFilter !== null && e.collection !== collectionFilter) return false;
      if (sensorFilter && e.sensor !== sensorFilter) return false;
      if (tagFilter && !(e.tags ?? []).includes(tagFilter)) return false;
      if (q) {
        const hay = `${e.title} ${e.slug} ${e.narrative ?? ""} ${(e.tags ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [manifest, search, collectionFilter, sensorFilter, tagFilter]);

  const save = useCallback(
    async (nextPicks: string[], nextStart: number) => {
      setSaveState("saving");
      setSaveError(null);
      try {
        const res = await fetch("/api/curate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ picks: nextPicks, startingNumber: nextStart }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch (err) {
        setSaveState("error");
        setSaveError((err as Error).message);
      }
    },
    [],
  );

  // Auto-save 1.5s after the last change. Skip the mount-effect that would
  // fire on initial state by comparing against the server-loaded initial.
  const initialRef = useRef(initialSelections);
  useEffect(() => {
    const unchanged =
      picks.length === initialRef.current.picks.length &&
      picks.every((s, i) => s === initialRef.current.picks[i]) &&
      startingNumber === initialRef.current.startingNumber;
    if (unchanged) return;
    const t = setTimeout(() => {
      save(picks, startingNumber);
      initialRef.current = { picks: [...picks], startingNumber };
    }, 1500);
    return () => clearTimeout(t);
  }, [picks, startingNumber, save]);

  const toggle = useCallback((slug: string) => {
    setPicks((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Inline edit inputs capture their own keys
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save(picks, startingNumber);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picks, startingNumber, save]);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = picks.indexOf(String(active.id));
    const to = picks.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    setPicks(arrayMove(picks, from, to));
  };

  const pickedEntries = picks
    .map((s) => bySlug.get(s))
    .filter((e): e is ManifestEntry => Boolean(e));

  const endNumber = startingNumber + picks.length - 1;

  return (
    <div className="min-h-screen font-sans text-ink">
      {saveError ? (
        <div
          role="alert"
          className="sticky top-0 z-40 border-b border-rust-deep bg-rust-deep/10 px-6 py-3 font-mono text-xs text-rust-deep"
        >
          Save failed: {saveError}
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="ml-4 underline"
          >
            dismiss
          </button>
        </div>
      ) : null}

      {/* STICKY TOP: counts, starting number, save */}
      <div className="sticky top-0 z-30 border-b border-sand/40 bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <h1 className="font-serif text-2xl leading-none text-ink">Curate</h1>
            <span className="text-muted">
              {picks.length} / {manifest.length} picked
              {picks.length > 0 && (
                <>
                  {" · "}
                  <span className="font-mono text-ink">
                    OA-{pad(startingNumber)} → OA-{pad(endNumber)}
                  </span>
                </>
              )}
            </span>
            <label className="flex items-center gap-2">
              <span className="text-muted">Start at OA-</span>
              <input
                type="number"
                min={1}
                value={startingNumber}
                onChange={(e) => setStartingNumber(Math.max(1, +e.target.value || 1))}
                className="w-16 rounded border border-sand bg-white px-2 py-1 font-mono"
              />
            </label>
            <button
              onClick={() => save(picks, startingNumber)}
              className="rounded border border-ink/20 bg-ink px-3 py-1 text-paper transition hover:opacity-80"
            >
              Save
            </button>
            <span
              className={cn(
                "font-mono text-xs uppercase tracking-wider",
                saveState === "saving" && "text-muted",
                saveState === "saved" && "text-rust-deep",
                saveState === "error" && "text-rust",
              )}
            >
              {saveState === "saving" && "saving…"}
              {saveState === "saved" && "saved"}
              {saveState === "error" && "save failed"}
            </span>
            <span className="ml-auto font-mono text-xs text-muted">
              / to search · ⌘S to save · drag picks to reorder
            </span>
          </div>

          {/* PICKS TRAY */}
          <div className="mt-3">
            {pickedEntries.length === 0 ? (
              <p className="font-mono text-xs italic text-muted">
                No picks yet. Click thumbnails below (or tap ↵ to jump to search).
              </p>
            ) : (
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={picks} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {pickedEntries.map((e, i) => (
                      <PickTile
                        key={e.slug}
                        entry={e}
                        label={`OA-${pad(startingNumber + i)}`}
                        onRemove={() => toggle(e.slug)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="border-t border-sand/30">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-6 py-3 text-sm">
            <input
              ref={searchRef}
              type="search"
              placeholder="Search title, description, tags (press / )"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[240px] rounded border border-sand bg-white px-3 py-1.5"
            />
            <select
              value={collectionFilter ?? ""}
              onChange={(e) =>
                setCollectionFilter(e.target.value ? +e.target.value : null)
              }
              className="rounded border border-sand bg-white px-2 py-1.5"
            >
              <option value="">All collections</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  Earth as Art {n}
                </option>
              ))}
            </select>
            <select
              value={sensorFilter}
              onChange={(e) => setSensorFilter(e.target.value)}
              className="rounded border border-sand bg-white px-2 py-1.5"
            >
              <option value="">All sensors</option>
              {sensors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="rounded border border-sand bg-white px-2 py-1.5"
            >
              <option value="">All regions</option>
              {locationTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(search || collectionFilter !== null || sensorFilter || tagFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCollectionFilter(null);
                  setSensorFilter("");
                  setTagFilter("");
                }}
                className="font-mono text-xs uppercase tracking-wider text-muted underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto font-mono text-xs text-muted">
              {filtered.length} shown
            </span>
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {filtered.length === 0 ? (
          <p className="py-20 text-center font-mono text-muted">No matches.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((e) => (
              <GalleryCard
                key={e.slug}
                entry={e}
                picked={picksSet.has(e.slug)}
                onToggle={() => toggle(e.slug)}
                onHover={setHovered}
              />
            ))}
          </div>
        )}
      </div>

      {/* HOVER CARD — shows narrative + metadata for currently-hovered entry */}
      {hovered && (
        <aside
          className="pointer-events-none fixed bottom-4 right-4 z-40 max-w-sm rounded-lg border border-sand/60 bg-paper-2/95 p-4 text-xs shadow-lg backdrop-blur"
          aria-hidden
        >
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            Earth as Art {hovered.collection}
            {hovered.sensor && ` · ${hovered.sensor}`}
            {hovered.scale && ` · ${hovered.scale}`}
          </div>
          <div className="font-serif text-base text-ink">{hovered.title}</div>
          {hovered.narrative && (
            <p className="mt-2 leading-relaxed text-ink-2">{hovered.narrative}</p>
          )}
          {hovered.tags && extractLocationTags(hovered.tags).length > 0 && (
            <div className="mt-2 font-mono text-[10px] text-muted">
              {extractLocationTags(hovered.tags).join(" · ")}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

function GalleryCard({
  entry,
  picked,
  onToggle,
  onHover,
}: {
  entry: ManifestEntry;
  picked: boolean;
  onToggle: () => void;
  onHover: (e: ManifestEntry | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => onHover(entry)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "group relative block aspect-square overflow-hidden rounded border text-left transition",
        picked
          ? "border-ink shadow-[0_0_0_3px_var(--color-rust-deep)]"
          : "border-sand/40 hover:border-ink/40",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.thumbUrl}
        alt=""
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition",
          !picked && "group-hover:scale-[1.02]",
          picked && "brightness-110",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/70">
          EaA {entry.collection}
        </div>
        <div className="font-sans text-xs font-medium text-white">{entry.title}</div>
      </div>
      {picked && (
        <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rust-deep font-mono text-xs font-bold text-paper">
          ✓
        </div>
      )}
    </button>
  );
}

function PickTile({
  entry,
  label,
  onRemove,
}: {
  entry: ManifestEntry;
  label: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.slug });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex w-24 shrink-0 flex-col overflow-hidden rounded border border-ink/20 bg-white"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="relative aspect-square cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${entry.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.thumbUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </button>
      <div className="flex items-center justify-between gap-1 px-1 py-1">
        <span className="truncate font-mono text-[9px] uppercase text-ink">
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[9px] text-rust-deep hover:underline"
          aria-label={`Remove ${entry.title}`}
        >
          ✕
        </button>
      </div>
      <div className="line-clamp-2 border-t border-sand/30 px-1.5 py-1 text-[10px] leading-tight text-ink-2">
        {entry.title}
      </div>
    </div>
  );
}
