"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { SceneCard } from "@/components/scene/SceneCard";
import type { Region, Scene, Sensor, Treatment } from "@/lib/scenes";
import { REGIONS, TREATMENTS } from "@/lib/scenes";
import { cn } from "@/lib/utils";

type RegionFilter = Region | "All";
type SensorFilter = "All" | "Sentinel-2" | "Landsat" | "ASTER" | "MODIS";
type TreatmentFilter = Treatment | "All";
type SortMode = "Newest" | "Oldest" | "Region A–Z";

const SENSOR_FILTERS: ReadonlyArray<SensorFilter> = [
  "All",
  "Sentinel-2",
  "Landsat",
  "ASTER",
  "MODIS",
];
const SORT_MODES: ReadonlyArray<SortMode> = [
  "Newest",
  "Oldest",
  "Region A–Z",
];

function matchesSensor(scene: Scene, filter: SensorFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Landsat")
    return scene.sensor === "Landsat 8" || scene.sensor === "Landsat 9";
  return (scene.sensor as string) === filter;
}

function compareScenes(a: Scene, b: Scene, mode: SortMode): number {
  if (mode === "Newest") return b.publishedAt.localeCompare(a.publishedAt);
  if (mode === "Oldest") return a.publishedAt.localeCompare(b.publishedAt);
  const byRegion = a.region.localeCompare(b.region);
  return byRegion !== 0 ? byRegion : a.title.localeCompare(b.title);
}

type ArchiveBrowserProps = {
  scenes: ReadonlyArray<Scene>;
};

export function ArchiveBrowser({ scenes }: ArchiveBrowserProps) {
  const reduce = useReducedMotion();
  const [region, setRegion] = useState<RegionFilter>("All");
  const [sensor, setSensor] = useState<SensorFilter>("All");
  const [treatment, setTreatment] = useState<TreatmentFilter>("All");
  const [sort, setSort] = useState<SortMode>("Newest");

  const filtered = useMemo(() => {
    return scenes
      .filter((s) => region === "All" || s.region === region)
      .filter((s) => matchesSensor(s, sensor))
      .filter((s) => treatment === "All" || s.treatment === treatment)
      .slice()
      .sort((a, b) => compareScenes(a, b, sort));
  }, [scenes, region, sensor, treatment, sort]);

  const total = scenes.length;
  const shown = filtered.length;

  return (
    <>
      <div className="sticky top-[72px] z-30 -mx-6 border-y border-sand/30 bg-paper-2/85 px-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 py-4">
          <FilterSelect
            label="Region"
            value={region}
            onChange={(v) => setRegion(v as RegionFilter)}
            options={["All", ...REGIONS]}
          />
          <FilterSelect
            label="Sensor"
            value={sensor}
            onChange={(v) => setSensor(v as SensorFilter)}
            options={SENSOR_FILTERS}
          />
          <FilterSelect
            label="Treatment"
            value={treatment}
            onChange={(v) => setTreatment(v as TreatmentFilter)}
            options={["All", ...TREATMENTS]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortMode)}
            options={SORT_MODES}
          />
          <p className="ml-auto font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            <span aria-hidden className="mr-2 text-rust">
              ◉
            </span>
            {shown === total
              ? `${total} scenes`
              : `${shown} of ${total}`}
          </p>
        </div>
      </div>

      <div className="mt-14">
        {filtered.length === 0 ? (
          <EmptyState
            onReset={() => {
              setRegion("All");
              setSensor("All");
              setTreatment("All");
            }}
          />
        ) : (
          <motion.div
            layout={!reduce}
            className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((scene, i) => (
                <motion.div
                  key={scene.slug}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SceneCard scene={scene} priority={i < 3} titleAs="h2" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<string>;
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em]",
        "text-muted",
      )}
    >
      <span>{label}</span>
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "appearance-none bg-transparent pr-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink",
            "cursor-pointer focus:outline-none focus:text-rust",
          )}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-rust"
        >
          ▾
        </span>
      </span>
    </label>
  );
}

type EmptyStateProps = {
  onReset: () => void;
};

function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-serif text-2xl italic text-ink-2">
        No scenes match this filter.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust-deep transition-opacity hover:opacity-75"
      >
        Reset filters →
      </button>
    </div>
  );
}
