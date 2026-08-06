import Link from 'next/link'
import { Logo } from '@/components/logo'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-background p-6 pb-16">
      <Link href="/" className="pt-2">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-xs text-muted-foreground">Last updated August 6, 2026</p>

        <div className="prose-sm mt-6 flex flex-col gap-5 text-sm leading-relaxed text-foreground">
          <p>
            This policy explains what information FirstTouch collects, why, and how it&apos;s handled. It is
            written in plain language, not legal boilerplate — if anything is unclear, contact us using the
            details at the bottom.
          </p>

          <section>
            <h2 className="text-sm font-bold">Accounts are created by an adult</h2>
            <p className="mt-1.5 text-muted-foreground">
              FirstTouch is a youth soccer coaching app, and many of the players using it are children. To
              keep that safe, every account is created and controlled by an adult — a parent or legal
              guardian, or a player who is 18 or older signing up for themselves. That adult authenticates
              with FirstTouch and adds one or more &quot;player&quot; profiles (their kids, or themselves)
              under their account. Each time a player profile is created — at signup, or later via
              &quot;Add player&quot; — the adult creating it must actively check a consent box confirming
              they are that player&apos;s parent/guardian (or the 18+ player themselves) and agree to this
              policy and our{' '}
              <Link href="/terms" className="font-semibold underline underline-offset-2">
                Terms of Service
              </Link>
              . That checkbox, and the time it was checked, is recorded against the player&apos;s profile.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Information we collect</h2>
            <ul className="mt-1.5 list-disc pl-5 text-muted-foreground [&>li]:mt-1">
              <li><span className="text-foreground">Account info:</span> the adult&apos;s name and email address, used for login and account correspondence.</li>
              <li><span className="text-foreground">Player info:</span> each player&apos;s name, age, soccer experience level, position, and self-rated attributes (pace, shooting, etc.).</li>
              <li><span className="text-foreground">Video clips:</span> footage you choose to upload for AI analysis or to send to a coach.</li>
              <li><span className="text-foreground">AI-derived movement data:</span> pose/movement metrics extracted from a clip (e.g. balance, symmetry), and the AI coaching feedback generated from them.</li>
              <li><span className="text-foreground">Coach notes and bookings:</span> any feedback a coach leaves on a clip, and session booking details you enter.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold">Where this data lives</h2>
            <p className="mt-1.5 text-muted-foreground">
              Account, player, coach-note, and booking data is stored in a Supabase-hosted Postgres
              database with row-level security — the database itself enforces that an account can only ever
              read or write the players, clips, notes, and bookings it owns. Video files are stored
              separately in Cloudflare R2 and are never public: every upload and playback goes through a
              short-lived, signed URL that&apos;s generated only after verifying your session and that the
              file belongs to your account.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Who else sees this data</h2>
            <p className="mt-1.5 text-muted-foreground">We don&apos;t sell your data. A small number of service providers process it on our behalf, strictly to run the app:</p>
            <ul className="mt-1.5 list-disc pl-5 text-muted-foreground [&>li]:mt-1">
              <li><span className="text-foreground">Supabase</span> — authentication and database hosting.</li>
              <li><span className="text-foreground">Cloudflare R2</span> — video file storage.</li>
              <li>
                <span className="text-foreground">Anthropic</span> — generates the AI coaching feedback. It
                receives the derived movement metrics and basic player info (name, age, position) needed to
                write personalized feedback — it does <span className="italic">not</span> receive your raw
                video.
              </li>
              <li><span className="text-foreground">Netlify</span> — hosts the website itself.</li>
            </ul>
            <p className="mt-1.5 text-muted-foreground">
              A human coach only sees a clip or its data if you explicitly send that clip to them from
              within the app.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">AI feedback isn&apos;t a substitute for a real coach</h2>
            <p className="mt-1.5 text-muted-foreground">
              Movement analysis and coaching feedback generated by AI is based on a single-camera, low-resolution
              estimate — it&apos;s meant as a helpful starting point, not a certified assessment. It is not
              medical, injury, or professional training advice, and shouldn&apos;t be treated as a replacement
              for guidance from a qualified human coach or medical professional.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Your rights, and your child&apos;s</h2>
            <p className="mt-1.5 text-muted-foreground">
              You can request a copy of, or the deletion of, your account&apos;s data (including any
              player profiles under it) at any time by emailing us — see below. We don&apos;t yet have a
              self-serve delete button in the app itself, so these requests are handled manually; we&apos;ll
              confirm once it&apos;s done.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Security</h2>
            <p className="mt-1.5 text-muted-foreground">
              We use industry-standard measures — encrypted connections, access-scoped credentials, and
              database-level row security — to protect your data. No system is perfectly secure, and we
              can&apos;t guarantee absolute protection against every possible threat.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Changes to this policy</h2>
            <p className="mt-1.5 text-muted-foreground">
              If this policy changes in a meaningful way, we&apos;ll update the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Contact</h2>
            <p className="mt-1.5 text-muted-foreground">
              Questions, data requests, or concerns:{' '}
              <a href="mailto:arivuganbu@gmail.com" className="font-semibold underline underline-offset-2">
                arivuganbu@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
