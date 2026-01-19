"use client"

import { Layout } from "./Layout"

const statItems = [
  { label: "Leagues monitored", value: "12" },
  { label: "Transfers ingested", value: "1,284" },
  { label: "API latency", value: "< 2 min" },
];

export function HomePage() {
  return (
    <Layout>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden>
          <div className="pointer-events-none blur-3xl">
            <div className="absolute inset-x-10 top-10 h-72 rounded-full bg-primary/20" />
            <div className="absolute right-0 top-1/3 h-60 w-60 rounded-full bg-secondary/10" />
            <div className="absolute left-0 bottom-10 h-48 w-48 rounded-full bg-accent/10" />
          </div>
        </div>

        <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 text-center lg:text-left">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Transfer Hub · Winter Window 2025
            </p>
            <h1 className="text-4xl font-black uppercase tracking-widest text-foreground sm:text-5xl lg:text-6xl">
              Pure transfer intel. Zero noise.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground lg:text-xl">
              We&apos;re building the definitive dark-mode dashboard for deadline day
              chaos. Real-time transfers, market pulse analytics, and insider
              signals—all in one focused command center. Soft launch arrives
              February 2, 2025.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <button 
                className="w-full rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/80 sm:w-auto"
                onClick={() => {
                  // TODO: Implement early access modal or navigation
                  // Early access functionality to be implemented in future iteration
                }}
                aria-label="Request early access to Transfer Hub V2"
              >
                Request early access
              </button>
              <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md sm:grid-cols-3">
            {statItems.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
