'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="apple-surface flex min-h-screen items-center justify-center px-6 py-12">
      <section className="glass-panel w-full max-w-md rounded-lg border border-border p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          Seite nicht gefunden
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Zur Startseite
        </Link>
      </section>
    </main>
  )
}
