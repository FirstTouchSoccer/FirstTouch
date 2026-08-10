'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mountBall } from './ball'
import { getSession } from '@/lib/store'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // The markup below never re-renders, so React and the imperative canvas
  // code never contend for the same nodes.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    return mountBall(root)
  }, [])

  // A visitor who's already signed in (e.g. an installed PWA opening at "/",
  // or someone who just bookmarked the bare domain) shouldn't have to find
  // their way back to /home through marketing copy. Checked after the page
  // has already started rendering rather than gating first paint.
  useEffect(() => {
    let cancelled = false
    getSession().then((session) => {
      if (session && !cancelled) router.replace('/home')
    })
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="ftp" ref={rootRef}>
      <header className="nav" id="ftp-nav">
        <div className="nav__in">
          <a className="mark" href="#top">
            <Logo size="sm" />
          </a>
          <div className="nav__actions">
            <ThemeToggle />
            <Link className="navLink" href="/login">Log in</Link>
            <Link className="btn btn--solid" href="/signup">Sign up</Link>
          </div>
        </div>
      </header>
      <div className="ballLayer" id="ftp-ballLayer" aria-hidden="true">
        <div className="ballVeil"></div>
        <canvas id="ftp-ball"></canvas>
      </div>
      <nav className="rail" id="ftp-rail" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </nav>
      <main id="top">
        <section className="stage" id="ftp-stage">
          <div className="stage__in">
            <div className="hero">
              <p className="eyebrow rise">Live now &#183; Founding member pricing</p>
              <h1 className="rise">Every session<br />becomes coaching.</h1>
              <p className="lede rise">Film thirty seconds on your phone. FirstTouch reads how the body
                moves, sorts each signal into a band you can act on, and writes the week&apos;s drills
                &#8212; before you&apos;ve even packed up the cones.</p>
              <div className="hero__cta rise">
                <Link className="btn btn--solid" href="/signup">Create your free account</Link>
                <a className="btn btn--ghost" href="#pricing">See the plans</a>
              </div>
              <div className="hero__meta rise">
                <span>2 free analyses, <b>no card needed</b></span>
                <span>Founding rate <b>$20/mo</b> after that</span>
                <span>Cancel anytime</span>
              </div>
            </div>
            <article className="feat feat--right" id="step-capture" data-feat="0">
              <div className="feat__tag rise"><i>01</i><span className="eyebrow">Capture</span></div>
              <h2 className="rise">Any phone. Any pitch.</h2>
              <p className="rise">Twenty to thirty seconds of your player doing what they already do:
                dribbling, finishing, 1v1s at the park. No markers, no tripod, no second camera,
                no asking a nine-year-old to stand on a spot. Film from roughly the same place each
                week and the week-to-week comparison sharpens.</p>
              <div className="feat__read rise"><b className="num">0:30</b><span>clip length</span></div>
            </article>
            <article className="feat feat--left" id="step-analyze" data-feat="1">
              <div className="feat__tag rise"><i>02</i><span className="eyebrow">Analyze</span></div>
              <h2 className="rise">Thirty-three points, every frame.</h2>
              <p className="rise">Pose tracking marks 33 joints in each frame, so we follow balance,
                hip and shoulder rotation, where the plant foot lands, and whether the timing holds
                from the first rep to the ninth. Body position is what a phone reads well. Ball
                speed and distance need a calibrated rig, so we leave those numbers alone.</p>
              <div className="feat__read rise"><b className="num">33</b><span>body points</span></div>
            </article>
            <article className="feat feat--right" id="step-score" data-feat="2">
              <div className="feat__tag rise"><i>03</i><span className="eyebrow">Score</span></div>
              <h2 className="rise">A rating built out of your own clips.</h2>
              <p className="rise">Every signal lands in a band you can read without a sports science
                degree: Developing, Solid, Strong. OVR rolls the bands into one number, weighed
                against your own last month rather than a league table nobody publishes. Open it
                and you see which band moved.</p>
              <div className="feat__read rise"><b className="num">78</b><span>overall rating</span></div>
            </article>
            <article className="feat feat--left" id="step-chat" data-feat="3">
              <div className="feat__tag rise"><i>04</i><span className="eyebrow">Ask</span></div>
              <h2 className="rise">Every read opens a conversation.</h2>
              <p className="rise">A score is a starting point, not the last word. Ask why a rating
                landed where it did, what to fix first, or how a drill carries over to a match, and
                FirstTouch&apos;s AI coach answers using that clip and your player&apos;s own history
                &#8212; right there under the result, no extra upload needed.</p>
              <div className="feat__read rise"><b>Included</b><span>with every analysis</span></div>
            </article>
            <article className="feat feat--right" id="step-train" data-feat="4">
              <div className="feat__tag rise"><i>05</i><span className="eyebrow">Train</span></div>
              <h2 className="rise">The week, already planned.</h2>
              <p className="rise">Benchmarks refresh every Monday: fifty touches on the weak foot, three
                reps with the plant foot inside the line, two clips of the same drill so the
                comparison is fair. Hit them, hold the streak, and watch the 7, 30 and 90 day
                lines bend.</p>
              <div className="feat__read rise"><b className="num">5</b><span>day streak</span></div>
            </article>
          </div>
        </section>
        <section className="sample">
          <div className="wrap">
            <div className="sample__head">
              <p className="eyebrow rise">The command center</p>
              <h2 className="rise">This is the card you open on Sunday morning.</h2>
              <p className="rise">Every stat traces back to a clip you filmed. Tap any number and you land
                on the frame it came from.</p>
            </div>
            <div className="cardRow">
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>
                  </span>
                  <span className="stat__delta">&#8599; up a band</span>
                </div>
                <div className="stat__val stat__val--word">Strong</div>
                <div className="stat__label">Balance through the turn</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 19h17"/><path d="M8 19v-3.4a4 4 0 018 0V19"/></svg>
                  </span>
                  <span className="stat__delta num">&#8599; +2</span>
                </div>
                <div className="stat__val num">7<em>of 9 reps</em></div>
                <div className="stat__label">Plant foot inside the line</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.6 12a8.4 8.4 0 0114.3-6"/><path d="M20.4 12a8.4 8.4 0 01-14.3 6"/><path d="M17.9 2.2V6h-3.8"/><path d="M6.1 21.8V18h3.8"/></svg>
                  </span>
                  <span className="stat__delta num">&#8599; +9</span>
                </div>
                <div className="stat__val num">82<em>%</em></div>
                <div className="stat__label">Rep-to-rep repeatability</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22c3.9 0 6.5-2.6 6.5-6 0-4.5-4-6-4-9.5 0 0-2.5 1.5-2.5 4.5C12 8 10 6 10 6S5.5 8.5 5.5 16c0 3.4 2.6 6 6.5 6z"/></svg>
                  </span>
                  <span className="stat__delta num">&#8599; On fire</span>
                </div>
                <div className="stat__val num">5<em>days</em></div>
                <div className="stat__label">Active streak</div>
              </div>
            </div>
            <p className="sample__note rise">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.6"/></svg>
              <span>The card above is our demo player, not a customer result. A phone camera reads
                body position well and ball contact poorly, so FirstTouch reports what it can see
                and labels every signal with how much it trusts it.</span>
            </p>
          </div>
        </section>
        <section className="pricing" id="pricing">
          <div className="wrap">
            <div className="pricing__head">
              <p className="eyebrow rise">Plans</p>
              <h2 className="rise">One plan. Everything unlocked.</h2>
              <p className="rise">Sign up and your first two analyses are free. Subscribe when you&apos;re
                ready, and the founding rate below is yours for as long as you stay subscribed &#8212;
                even after the list price goes up.</p>
            </div>
            <div className="plans plans--single">
              <div className="plan rise">
                <div className="plan__name">FirstTouch Pro</div>
                <div>
                  <div className="plan__price">
                    <b className="num">$20</b><span className="plan__per">/ month, founding rate</span>
                  </div>
                  <p className="plan__sub">One account. Every player on it. List price $40/month.</p>
                </div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Unlimited AI clip analyses</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Movement bands: balance, plant foot, rotation, timing</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>OVR rating and the full stat card</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Ask-anything AI chat on every analysis</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Progression across 7, 30 and 90 days</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Every player on your account included</span></li>
                </ul>
                <Link className="btn btn--solid btn--wide" href="/signup">Start free</Link>
                <p className="plan__foot">2 free analyses, then $20/mo &#8212; cancel anytime</p>
              </div>
            </div>
            <p className="trialLine rise">Not ready to subscribe? <b>Your first two analyses are free.</b> No card, no trial timer.</p>
          </div>
        </section>
        <section className="order" id="signup">
          <div className="wrap">
            <div className="order__grid">
              <div className="order__copy">
                <p className="eyebrow rise">Get started</p>
                <h2 className="rise">Your first clip could be tonight&apos;s homework.</h2>
                <p className="rise">Create an account, add your player, and upload a clip. Two analyses
                  are free &#8212; no card, nothing to cancel if it&apos;s not for you.</p>
                <div className="faq rise">
                  <details>
                    <summary>What do I need to film a clip?</summary>
                    <p>A phone and about thirty seconds. Landscape helps, daylight helps more, but
                      there&apos;s no kit to buy and nothing to set up on the pitch.</p>
                  </details>
                  <details>
                    <summary>What can the AI genuinely see?</summary>
                    <p>Body position. Balance, symmetry, posture, where the plant foot lands, how
                      your timing holds across reps. It reads ball contact and technique far less
                      reliably, and one uncalibrated phone cannot measure shot speed or distance,
                      so we don&apos;t print those numbers. Every clip shows which signals it trusted.</p>
                  </details>
                  <details>
                    <summary>Which AI writes the feedback?</summary>
                    <p>Claude, from Anthropic. It never receives your video. Pose tracking turns the
                      clip into movement signals first, and Claude only sees those signals plus your
                      own history, so the write-up is about how the body moved and never about who
                      is in the frame.</p>
                  </details>
                  <details>
                    <summary>Is my child&apos;s data safe?</summary>
                    <p>FirstTouch is built with COPPA in mind: a parent or guardian creates and
                      controls the account, clips and analyses are never used to train any AI
                      model, and there are no ad trackers on this site. The full breakdown is in
                      our <Link href="/privacy">Privacy Policy</Link>.</p>
                  </details>
                  <details>
                    <summary>Do I need a card to try it?</summary>
                    <p>No. Every account starts with two free analyses. FirstTouch Pro is $20/month
                      after that at the founding rate, billed to the parent or guardian account, and
                      you can cancel anytime from Manage Billing.</p>
                  </details>
                </div>
              </div>
              <div className="form rise">
                <div>
                  <h3 style={{ fontSize: 'var(--ftp-step-2)' }}>Create your account</h3>
                  <p style={{ color: 'var(--ftp-ink-soft)', marginTop: '8px' }}>
                    Takes about a minute. Add your player and you&apos;re ready to film.
                  </p>
                </div>
                <Link className="btn btn--solid btn--wide" href="/signup">Sign up free</Link>
                <p className="form__fine">
                  Already have an account? <Link href="/login">Log in</Link>.
                  <br />
                  No card required for your first 2 analyses. <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot__in">
          <span>FirstTouch &#183; AI soccer development</span>
          <span className="foot__links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log in</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
