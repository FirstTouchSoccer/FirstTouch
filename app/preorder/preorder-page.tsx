'use client'

import { useEffect, useRef } from 'react'
import { mountBall } from './ball'

export function PreorderPage() {
  const rootRef = useRef<HTMLDivElement>(null)

  // The markup below never re-renders, so React and the imperative canvas
  // code never contend for the same nodes.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    return mountBall(root)
  }, [])

  return (
    <div className="ftp" ref={rootRef}>
      <header className="nav" id="ftp-nav">
        <div className="nav__in">
          <a className="mark" href="#top">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8.6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 5.4l3.1 2.25-1.18 3.64H8.08L6.9 7.65 10 5.4z" fill="currentColor"/>
            </svg>
            FirstTouch
          </a>
          <a className="btn btn--solid" href="#preorder">Preorder</a>
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
              <p className="eyebrow rise">Preorder &#183; Founding season</p>
              <h1 className="rise">Every session<br />becomes coaching.</h1>
              <p className="lede rise">Film thirty seconds on your phone. FirstTouch reads how the body
                moves, sorts each signal into a band you can act on, and writes the week's drills.
                On Academy a real coach watches the same clip.</p>
              <div className="hero__cta rise">
                <a className="btn btn--solid" href="#preorder">Reserve a spot</a>
                <a className="btn btn--ghost" href="#pricing">See the plans</a>
              </div>
              <div className="hero__meta rise">
                <span>Opens <b>September 2026</b></span>
                <span>Founding price locked <b>12 months</b></span>
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
            <article className="feat feat--left" id="step-review" data-feat="3">
              <div className="feat__tag rise"><i>04</i><span className="eyebrow">Review</span></div>
              <h2 className="rise">A real coach, pinned to the frame.</h2>
              <p className="rise">On Academy, a coach opens the same clip and leaves notes at the second
                they matter: plant foot too far back, shoulders closed before the turn. Each note
                carries the drill that fixes it, and a human catches the technique the pose model
                admits it can't judge.</p>
              <div className="feat__read rise"><b className="num">48</b><span>hour turnaround</span></div>
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
              <h2 className="rise">Founding pricing, held for a year.</h2>
              <p className="rise">Reserve now and the rate below is what you pay for twelve months from
                the day we open &#8212; whatever the list price is by then.</p>
            </div>
            <div className="plans">
              <div className="plan rise">
                <div className="plan__name">Pro</div>
                <div>
                  <div className="plan__price"><b className="num">$29.99</b><span className="plan__per">/ month</span></div>
                  <p className="plan__sub">One player. Everything the AI can do.</p>
                </div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>20 AI clip breakdowns a month</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Movement bands: balance, plant foot, rotation, timing</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>OVR rating and the full stat card</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Progression across 7, 30 and 90 days</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Weekly benchmarks, streaks and a drill plan</span></li>
                </ul>
                <a className="btn btn--ghost btn--wide" href="#preorder">Reserve Pro</a>
                <p className="plan__foot">$29.99 today, then monthly at launch</p>
              </div>
              <div className="plan plan--dark rise">
                <div className="plan__name">Academy <span className="plan__badge">15 players</span></div>
                <div>
                  <div className="plan__price"><b className="num">$299</b><span className="plan__per">/ month</span></div>
                  <p className="plan__sub">Whole squad. Works out at $19.93 a player.</p>
                </div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Everything in Pro, for all 15 players</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>2 coach reviews per player each month</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Coach dashboard across the whole roster</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>Squad-wide progression and comparison</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>48-hour review turnaround, priority queue</span></li>
                </ul>
                <a className="btn btn--solid btn--wide" href="#preorder">Reserve Academy</a>
                <p className="plan__foot">Extra players $19.93 / month each</p>
              </div>
            </div>
            <p className="trialLine rise">Not ready to commit? <b>Your first clip is free</b> when we open. No card, no trial timer.</p>
          </div>
        </section>
        <section className="order" id="preorder">
          <div className="wrap">
            <div className="order__grid">
              <div className="order__copy">
                <p className="eyebrow rise">Reserve</p>
                <h2 className="rise">Get in before the first whistle.</h2>
                <p className="rise">Tell us who's playing and we'll hold your founding rate. You'll hear
                  from us once &#8212; the week we open.</p>
                <div className="faq rise">
                  <details>
                    <summary>When does FirstTouch actually open?</summary>
                    <p>September 2026, ahead of the autumn season. Everyone who reserves gets access
                      in the order they signed up.</p>
                  </details>
                  <details>
                    <summary>What do I need to film a clip?</summary>
                    <p>A phone and about thirty seconds. Landscape helps, daylight helps more, but
                      there's no kit to buy and nothing to set up on the pitch.</p>
                  </details>
                  <details>
                    <summary>What can the AI genuinely see?</summary>
                    <p>Body position. Balance, symmetry, posture, where the plant foot lands, how
                      your timing holds across reps. It reads ball contact and technique far less
                      reliably, and one uncalibrated phone cannot measure shot speed or distance,
                      so we don't print those numbers. Every clip shows which signals it trusted,
                      and a human coach covers the rest on Academy.</p>
                  </details>
                  <details>
                    <summary>Which AI writes the feedback?</summary>
                    <p>Claude, from Anthropic. It never receives your video. Pose tracking turns the
                      clip into movement signals first, and Claude only sees those signals plus your
                      own history, so the write-up is about how the body moved and never about who
                      is in the frame.</p>
                  </details>
                  <details id="data">
                    <summary>What happens to the details I give you?</summary>
                    <p>Your name, the email and the age group are used for one thing: telling you
                      when preorders open. We don't sell them, we don't hand them to advertisers,
                      and every message we send carries an unsubscribe link. This page sets no
                      cookies, stores nothing in your browser and loads nothing from a third-party
                      server. Ask us to delete your details at any point and we will.</p>
                    <p>We ask for the player's age group, not the player's name or any detail about
                      them. The account holder is the adult. A full privacy policy and terms go live
                      before we accept a real signup or take a payment.</p>
                  </details>
                  <details>
                    <summary>Am I charged today?</summary>
                    <p>No. Reserving holds your rate and your place. Billing starts the day your
                      account opens, and you can cancel before then or any month after.</p>
                  </details>
                </div>
              </div>
              <form className="form rise" id="ftp-form" method="post" noValidate>
                <div className="form__body">
                  <div className="field">
                    <label htmlFor="ftp-pname">Your name</label>
                    <input id="ftp-pname" name="pname" type="text" autoComplete="name" placeholder="Alex Rivera" required />
                  </div>
                  <div className="field">
                    <label htmlFor="ftp-pmail">Email</label>
                    <input id="ftp-pmail" name="pmail" type="email" autoComplete="email" placeholder="alex@example.com" required />
                    <small>One message, the week we open. Nothing else.</small>
                  </div>
                  <div className="field">
                    <label htmlFor="ftp-page">Player's age group</label>
                    <select id="ftp-page" name="page" defaultValue="U11 – U13">
                      <option>U8 &#8211; U10</option>
                      <option>U11 &#8211; U13</option>
                      <option>U14 &#8211; U16</option>
                      <option>U17 and above</option>
                      <option>A whole squad</option>
                    </select>
                  </div>
                  <div className="pick">
                    <span>Which plan?</span>
                    <div className="pick__opts">
                      <input type="radio" id="ftp-tier-pro" name="tier" value="Pro" defaultChecked />
                      <label htmlFor="ftp-tier-pro"><b>Pro</b><em>$29.99 / month</em></label>
                      <input type="radio" id="ftp-tier-acad" name="tier" value="Academy" />
                      <label htmlFor="ftp-tier-acad"><b>Academy</b><em>$299 / month</em></label>
                    </div>
                  </div>
                  <label className="consent" id="ftp-consentRow">
                    <input type="checkbox" id="ftp-pconsent" name="pconsent" />
                    <span>I'm a parent or guardian, or a player aged 18 or over, and FirstTouch
                      may email me when preorders open.</span>
                  </label>
                  <button className="btn btn--solid btn--wide" type="submit">Reserve my spot</button>
                  <p className="form__fine">No card required. Founding rate held for 12 months.
                    <a href="#data">What we do with your details</a>.</p>
                </div>
                <div className="done">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M7.8 12.4l2.9 2.8 5.5-6"/></svg>
                  <h3>You're on the list.</h3>
                  <p id="ftp-doneMsg">We'll email you the week FirstTouch opens.</p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot__in">
          <span>FirstTouch &#183; AI soccer development</span>
          <span className="foot__links">
            <a href="#data">How we use your details</a>
            <a href="#pricing">Pricing</a>
            <a href="#preorder">Preorder</a>
          </span>
          <span>Season 2026</span>
        </div>
      </footer>
    </div>
  )
}
