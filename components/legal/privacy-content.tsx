'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

const LAST_UPDATED_ISO = '2026-08-11'

export function PrivacyContent() {
  const { language } = useTranslation()

  if (language === 'ru') {
    return (
      <>
        <h1 className="text-xl font-bold tracking-tight">Политика конфиденциальности</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          <time dateTime={LAST_UPDATED_ISO}>Обновлено 11 августа 2026 г.</time>
        </p>

        <div className="prose-sm mt-6 flex flex-col gap-5 text-sm leading-relaxed text-foreground">
          <p>
            Эта политика объясняет, какую информацию собирает FirstTouch, зачем и как она обрабатывается. Она
            написана простым языком, а не юридическим канцеляритом — если что-то неясно, свяжитесь с нами по
            контактам внизу.
          </p>

          <section>
            <h2 className="text-sm font-bold">Аккаунт создаёт взрослый</h2>
            <p className="mt-1.5 text-muted-foreground">
              FirstTouch — приложение для юных футболистов, и многие игроки, использующие его, — дети. Чтобы
              это было безопасно, каждый аккаунт создаёт и контролирует взрослый — родитель или законный
              опекун, либо игрок 18 лет и старше, регистрирующийся для себя. Этот взрослый проходит
              аутентификацию в FirstTouch и добавляет один или несколько профилей «игрока» (своих детей или
              себя) на свой аккаунт. При каждом создании профиля игрока — при регистрации или позже через
              «Добавить игрока» — создающий его взрослый должен активно отметить галочку согласия,
              подтверждающую, что он родитель/опекун этого игрока (либо сам игрок 18+), и принять эту политику
              и наши{' '}
              <Link href="/terms" className="font-semibold underline underline-offset-2">
                Условия использования
              </Link>
              . Эта галочка и момент её установки фиксируются в профиле игрока.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Какую информацию мы собираем</h2>
            <ul className="mt-1.5 list-disc pl-5 text-muted-foreground [&>li]:mt-1">
              <li><span className="text-foreground">Данные аккаунта:</span> имя и email взрослого — для входа и переписки по аккаунту.</li>
              <li><span className="text-foreground">Данные игрока:</span> имя, возраст, уровень опыта в футболе, позиция и самооценка атрибутов каждого игрока (скорость, удар и т.д.).</li>
              <li><span className="text-foreground">Видеоролики:</span> отснятый материал, который вы загружаете для ИИ-анализа или отправки тренеру.</li>
              <li><span className="text-foreground">Данные о движении от ИИ:</span> показатели позы/движения, извлечённые из ролика (например, баланс, симметрия), и разбор от ИИ-тренера, построенный на них.</li>
              <li><span className="text-foreground">Заметки тренера и бронирования:</span> любой разбор, который тренер оставляет на ролике, и детали забронированных сессий, которые вы вводите.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold">Где хранятся эти данные</h2>
            <p className="mt-1.5 text-muted-foreground">
              Данные аккаунта, игроков, заметок тренера и бронирований хранятся в базе данных Postgres на
              Supabase с защитой на уровне строк (row-level security) — сама база данных обеспечивает, что
              аккаунт может читать и изменять только те профили игроков, ролики, заметки и бронирования,
              которые ему принадлежат. Видеофайлы хранятся отдельно в Cloudflare R2 и никогда не публичны:
              каждая загрузка и воспроизведение идут через короткоживущую подписанную ссылку, которая
              создаётся только после проверки вашей сессии и того, что файл принадлежит вашему аккаунту.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Кто ещё видит эти данные</h2>
            <p className="mt-1.5 text-muted-foreground">Мы не продаём ваши данные. Небольшое число поставщиков услуг обрабатывает их от нашего имени, исключительно для работы приложения:</p>
            <ul className="mt-1.5 list-disc pl-5 text-muted-foreground [&>li]:mt-1">
              <li><span className="text-foreground">Supabase</span> — аутентификация и хостинг базы данных.</li>
              <li><span className="text-foreground">Cloudflare R2</span> — хранение видеофайлов.</li>
              <li>
                <span className="text-foreground">Anthropic</span> — генерирует разбор от ИИ-тренера. Получает
                извлечённые показатели движения и базовые данные игрока (имя, возраст, позицию), необходимые
                для написания персонализированного разбора — ваше исходное видео он{' '}
                <span className="italic">не</span> получает, и эти данные используются только для генерации
                конкретного запрошенного вами разбора. Они не используются для обучения ИИ-моделей, рекламы
                или любых других целей помимо генерации этого ответа.
              </li>
              <li><span className="text-foreground">Stripe</span> — обрабатывает оплату подписки Pro. Получает только платёжные данные родителя/опекуна; профили игроков и данные о видео/движении в Stripe никогда не передаются.</li>
              <li><span className="text-foreground">Netlify</span> — размещает сам сайт.</li>
            </ul>
            <p className="mt-1.5 text-muted-foreground">
              Живой тренер видит ролик или его данные только если вы явно отправляете этот ролик ему изнутри
              приложения. Мы не используем рекламные трекеры и не продаём и не передаём данные какого-либо
              игрока для поведенческой рекламы.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Разбор от ИИ не заменяет настоящего тренера</h2>
            <p className="mt-1.5 text-muted-foreground">
              Анализ движения и разбор от ИИ построены на низкоточной оценке с одной камеры — задуманы как
              полезная отправная точка, а не сертифицированная оценка. Это не медицинская, травматологическая
              или профессиональная тренерская консультация, и не должна восприниматься как замена рекомендаций
              квалифицированного живого тренера или медицинского специалиста.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Ваши права и права вашего ребёнка (COPPA)</h2>
            <p className="mt-1.5 text-muted-foreground">
              Поскольку FirstTouch используют дети младше 13 лет, мы обрабатываем данные игроков в
              соответствии с американским законом о защите конфиденциальности детей в интернете (COPPA). Как
              родитель/опекун, создавший профиль игрока, вы можете в любой момент: посмотреть личную
              информацию, которую мы собрали о вашем ребёнке, запросить её удаление и отказаться от сбора
              любой дальнейшей информации о вашем ребёнке — просто написав нам (см. ниже) или прекратив
              использование приложения. Мы собираем только то, что нужно для работы уже используемых вами
              функций (анализ, заметки тренера, бронирования), не обуславливаем доступ к основным функциям
              сбором чего-то большего, и пока у нас нет кнопки самостоятельного удаления в самом приложении,
              поэтому такие запросы обрабатываются вручную — мы подтвердим, когда это будет сделано.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Ваши права, если вам 18 лет или больше</h2>
            <p className="mt-1.5 text-muted-foreground">
              Если вы зарегистрировали собственный аккаунт как игрок 18 лет или старше, на вас напрямую
              распространяются те же практические права — на общих основаниях защиты
              персональных данных, а не по COPPA (который касается только детей младше 13 лет): вы можете в
              любой момент посмотреть личную информацию, которую мы о вас собрали, запросить её удаление и
              прекратить любой дальнейший сбор — просто написав нам (см. ниже) или закрыв аккаунт. Как и
              выше, мы собираем только то, что нужно для работы уже используемых вами функций, не
              обуславливаем доступ к основным функциям сбором чего-то большего, и пока обрабатываем такие
              запросы вручную — до появления кнопки самостоятельного удаления.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Безопасность</h2>
            <p className="mt-1.5 text-muted-foreground">
              Мы используем отраслевые стандартные меры — шифрованные соединения, доступ с ограниченными
              учётными данными и защиту на уровне базы данных — для защиты ваших данных. Ни одна система не
              бывает абсолютно защищённой, и мы не можем гарантировать полную защиту от любой возможной угрозы.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Изменения этой политики</h2>
            <p className="mt-1.5 text-muted-foreground">
              Если эта политика существенно изменится, мы обновим дату в верхней части этой страницы.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold">Контакты</h2>
            <p className="mt-1.5 text-muted-foreground">
              Вопросы, запросы по данным или замечания:{' '}
              <a href="mailto:arivuganbu@gmail.com" className="font-semibold underline underline-offset-2">
                arivuganbu@gmail.com
              </a>
            </p>
          </section>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        <time dateTime={LAST_UPDATED_ISO}>Last updated August 11, 2026</time>
      </p>

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
              video, and that data is used only to generate the specific feedback you requested. It is not
              used to train AI models, for advertising, or for any purpose beyond producing that response.
            </li>
            <li><span className="text-foreground">Stripe</span> — processes payment for a Pro subscription. It receives the parent/guardian&apos;s billing information only; player profiles and video/movement data are never sent to Stripe.</li>
            <li><span className="text-foreground">Netlify</span> — hosts the website itself.</li>
          </ul>
          <p className="mt-1.5 text-muted-foreground">
            A human coach only sees a clip or its data if you explicitly send that clip to them from
            within the app. We don&apos;t run advertising trackers or sell or share any player&apos;s
            information for behavioral advertising.
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
          <h2 className="text-sm font-bold">Your rights, and your child&apos;s (COPPA)</h2>
          <p className="mt-1.5 text-muted-foreground">
            Because FirstTouch is used by children under 13, we handle player data in line with the
            Children&apos;s Online Privacy Protection Act (COPPA). As the parent/guardian who created a
            player&apos;s profile, you can at any time: review the personal information we&apos;ve
            collected about your child, request that we delete it, and refuse to let us collect any further
            information from or about your child — simply by emailing us (see below) or stopping use of the
            app. We only collect what&apos;s needed to run the features you&apos;ve used (analysis, coach
            notes, bookings), we don&apos;t condition access to core features on collecting more than
            that, and we don&apos;t yet have a self-serve delete button in the app itself, so these
            requests are handled manually — we&apos;ll confirm once it&apos;s done.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold">Your rights, if you&apos;re 18 or older</h2>
          <p className="mt-1.5 text-muted-foreground">
            If you registered your own account as an 18-or-older player, the same practical rights apply to
            you directly — on general data-privacy grounds rather than COPPA, which only covers children
            under 13. You can at any time: review the personal information we&apos;ve collected about you,
            request that we delete it, and stop any further collection — simply by emailing us (see below)
            or closing your account. As above, we only collect what&apos;s needed to run the features
            you&apos;ve used, we don&apos;t condition access to core features on collecting more than that,
            and these requests are handled manually until a self-serve option exists.
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
    </>
  )
}
