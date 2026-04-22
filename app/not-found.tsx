import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        ◉ 404 · signal lost
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink">
        No scene at these <span className="italic text-rust">coordinates.</span>
      </h1>
      <p className="mt-6 max-w-md font-sans text-base text-ink-2">
        The page you were looking for isn&rsquo;t in the archive.
      </p>
      <Link
        href="/"
        className="mt-10 font-mono text-sm uppercase tracking-[0.2em] text-rust hover:underline"
      >
        ← Return home
      </Link>
    </section>
  );
}
