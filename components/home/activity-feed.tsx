import Image from 'next/image'
import {
  Play,
  Award,
  MessageSquareText,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

export function ActivityFeed() {
  return (
    <section className="px-5 pt-8" aria-label="Activity and reviews">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Activity &amp; Reviews</h2>
        <button
          type="button"
          className="text-xs font-medium text-primary"
        >
          See all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Recent upload highlight */}
        <article className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-video w-full">
            <Image
              src="/clip-first-touch.png"
              alt="First touch control drill analysis"
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-sand-foreground">
              <Award className="h-3.5 w-3.5" />
              New milestone
            </div>
            <button
              type="button"
              aria-label="Play clip"
              className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-card/90 text-foreground backdrop-blur-sm"
            >
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </button>
            <p className="absolute bottom-3 left-3 text-sm font-semibold text-[color:var(--secondary)]">
              First Touch Control · +12% precision
            </p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Analyzed 2 hours ago · 0:48
            </p>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
              AI reviewed
            </span>
          </div>
        </article>

        {/* Coach alert */}
        <article className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose/20 text-rose">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Coach Marcus</p>
            <p className="truncate text-xs text-muted-foreground">
              Left 3 timestamped notes on your clip.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </article>

        {/* AI pick for you */}
        <article className="overflow-hidden rounded-2xl border border-primary/30 bg-secondary/60">
          <div className="flex items-center gap-1.5 px-4 pt-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              AI Pick for You
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 pt-2">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="/clip-positioning.png"
                alt="Positioning masterclass clip"
                fill
                className="object-cover"
                sizes="96px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30">
                <Play className="h-5 w-5 fill-current text-[color:var(--secondary)]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-pretty">
                Positioning Masterclass: Finding Space
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Picked to boost your lowest stat this week — tactical
                awareness.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
