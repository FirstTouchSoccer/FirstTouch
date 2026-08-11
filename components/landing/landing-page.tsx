'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mountBall } from './ball'
import { getSession } from '@/lib/store'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslation } from '@/lib/i18n/context'

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useTranslation()
  const l = t.landing

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
            <LanguageToggle />
            <ThemeToggle />
            <Link className="navLink" href="/login">{l.navLogIn}</Link>
            <Link className="btn btn--solid" href="/signup">{l.navSignUp}</Link>
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
              <p className="eyebrow rise">{l.eyebrow}</p>
              <h1 className="rise">{l.heroTitle1}<br />{l.heroTitle2}</h1>
              <p className="lede rise">{l.heroLede}</p>
              <div className="hero__cta rise">
                <Link className="btn btn--solid" href="/signup">{l.ctaCreateAccount}</Link>
                <a className="btn btn--ghost" href="#pricing">{l.ctaSeePlans}</a>
              </div>
              <div className="hero__meta rise">
                <span>{l.metaFree}<b>{l.metaFreeBold}</b></span>
                <span>{l.metaFounding}<b>{l.metaFoundingBold}</b>{l.metaFoundingAfter}</span>
                <span>{l.metaCancel}</span>
              </div>
            </div>
            <article className="feat feat--right" id="step-capture" data-feat="0">
              <div className="feat__tag rise"><i>{l.step01Tag}</i><span className="eyebrow">{l.step01Eyebrow}</span></div>
              <h2 className="rise">{l.step01Title}</h2>
              <p className="rise">{l.step01Body}</p>
              <div className="feat__read rise"><b className="num">{l.step01ReadNum}</b><span>{l.step01ReadLabel}</span></div>
            </article>
            <article className="feat feat--left" id="step-analyze" data-feat="1">
              <div className="feat__tag rise"><i>{l.step02Tag}</i><span className="eyebrow">{l.step02Eyebrow}</span></div>
              <h2 className="rise">{l.step02Title}</h2>
              <p className="rise">{l.step02Body}</p>
              <div className="feat__read rise"><b className="num">{l.step02ReadNum}</b><span>{l.step02ReadLabel}</span></div>
            </article>
            <article className="feat feat--right" id="step-score" data-feat="2">
              <div className="feat__tag rise"><i>{l.step03Tag}</i><span className="eyebrow">{l.step03Eyebrow}</span></div>
              <h2 className="rise">{l.step03Title}</h2>
              <p className="rise">{l.step03Body}</p>
              <div className="feat__read rise"><b className="num">{l.step03ReadNum}</b><span>{l.step03ReadLabel}</span></div>
            </article>
            <article className="feat feat--left" id="step-chat" data-feat="3">
              <div className="feat__tag rise"><i>{l.step04Tag}</i><span className="eyebrow">{l.step04Eyebrow}</span></div>
              <h2 className="rise">{l.step04Title}</h2>
              <p className="rise">{l.step04Body}</p>
              <div className="feat__read rise"><b>{l.step04ReadWord}</b><span>{l.step04ReadLabel}</span></div>
            </article>
            <article className="feat feat--right" id="step-train" data-feat="4">
              <div className="feat__tag rise"><i>{l.step05Tag}</i><span className="eyebrow">{l.step05Eyebrow}</span></div>
              <h2 className="rise">{l.step05Title}</h2>
              <p className="rise">{l.step05Body}</p>
              <div className="feat__read rise"><b className="num">{l.step05ReadNum}</b><span>{l.step05ReadLabel}</span></div>
            </article>
          </div>
        </section>
        <section className="sample">
          <div className="wrap">
            <div className="sample__head">
              <p className="eyebrow rise">{l.sampleEyebrow}</p>
              <h2 className="rise">{l.sampleTitle}</h2>
              <p className="rise">{l.sampleLede}</p>
            </div>
            <div className="cardRow">
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>
                  </span>
                  <span className="stat__delta">{l.sampleStat1Delta}</span>
                </div>
                <div className="stat__val stat__val--word">{l.sampleStat1Val}</div>
                <div className="stat__label">{l.sampleStat1Label}</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 19h17"/><path d="M8 19v-3.4a4 4 0 018 0V19"/></svg>
                  </span>
                  <span className="stat__delta num">{l.sampleStat2Delta}</span>
                </div>
                <div className="stat__val num">7<em>{l.sampleStat2Suffix}</em></div>
                <div className="stat__label">{l.sampleStat2Label}</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.6 12a8.4 8.4 0 0114.3-6"/><path d="M20.4 12a8.4 8.4 0 01-14.3 6"/><path d="M17.9 2.2V6h-3.8"/><path d="M6.1 21.8V18h3.8"/></svg>
                  </span>
                  <span className="stat__delta num">{l.sampleStat3Delta}</span>
                </div>
                <div className="stat__val num">82<em>%</em></div>
                <div className="stat__label">{l.sampleStat3Label}</div>
              </div>
              <div className="stat rise">
                <div className="stat__top">
                  <span className="stat__ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22c3.9 0 6.5-2.6 6.5-6 0-4.5-4-6-4-9.5 0 0-2.5 1.5-2.5 4.5C12 8 10 6 10 6S5.5 8.5 5.5 16c0 3.4 2.6 6 6.5 6z"/></svg>
                  </span>
                  <span className="stat__delta num">{l.sampleStat4Delta}</span>
                </div>
                <div className="stat__val num">5<em>{l.sampleStat4Suffix}</em></div>
                <div className="stat__label">{l.sampleStat4Label}</div>
              </div>
            </div>
            <p className="sample__note rise">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.6"/></svg>
              <span>{l.sampleNote}</span>
            </p>
          </div>
        </section>
        <section className="pricing" id="pricing">
          <div className="wrap">
            <div className="pricing__head">
              <p className="eyebrow rise">{l.pricingEyebrow}</p>
              <h2 className="rise">{l.pricingTitle}</h2>
              <p className="rise">{l.pricingLede}</p>
            </div>
            <div className="plans plans--single">
              <div className="plan rise">
                <div className="plan__name">{l.planName}</div>
                <div>
                  <div className="plan__price">
                    <b className="num">$20</b><span className="plan__per">{l.planPricePer}</span>
                  </div>
                  <p className="plan__sub">{l.planSub}</p>
                </div>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature1}</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature2}</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature3}</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature4}</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature5}</span></li>
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5.2 5L20 6.5"/></svg><span>{l.planFeature6}</span></li>
                </ul>
                <Link className="btn btn--solid btn--wide" href="/signup">{l.planCta}</Link>
                <p className="plan__foot">{l.planFoot}</p>
              </div>
            </div>
            <p className="trialLine rise">{l.trialLine}<b>{l.trialLineBold}</b></p>
          </div>
        </section>
        <section className="order" id="signup">
          <div className="wrap">
            <div className="order__grid">
              <div className="order__copy">
                <p className="eyebrow rise">{l.signupEyebrow}</p>
                <h2 className="rise">{l.signupTitle}</h2>
                <p className="rise">{l.signupLede}</p>
                <div className="faq rise">
                  <details>
                    <summary>{l.faq1Q}</summary>
                    <p>{l.faq1A}</p>
                  </details>
                  <details>
                    <summary>{l.faq2Q}</summary>
                    <p>{l.faq2A}</p>
                  </details>
                  <details>
                    <summary>{l.faq3Q}</summary>
                    <p>{l.faq3A}</p>
                  </details>
                  <details>
                    <summary>{l.faq4Q}</summary>
                    <p>{l.faq4A}</p>
                  </details>
                  <details>
                    <summary>{l.faq5Q}</summary>
                    <p>{l.faq5A}</p>
                  </details>
                </div>
              </div>
              <div className="form rise">
                <div>
                  <h3 style={{ fontSize: 'var(--ftp-step-2)' }}>{l.formTitle}</h3>
                  <p style={{ color: 'var(--ftp-ink-soft)', marginTop: '8px' }}>
                    {l.formLede}
                  </p>
                </div>
                <Link className="btn btn--solid btn--wide" href="/signup">{l.formCta}</Link>
                <p className="form__fine">
                  {l.formHaveAccount} <Link href="/login">{l.formLogIn}</Link>.
                  <br />
                  {l.formFine} <Link href="/privacy">{l.formPrivacy}</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot__in">
          <span>{l.footTagline}</span>
          <span className="foot__links">
            <Link href="/privacy">{l.footPrivacy}</Link>
            <Link href="/terms">{l.footTerms}</Link>
            <Link href="/login">{l.footLogIn}</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
