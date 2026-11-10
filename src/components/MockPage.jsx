import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context.jsx'
import { industries, questions } from '../utils/catalog.js'
import { TAGS, TAG_LABEL } from '../utils/topics.js'
import { useDictation } from '../utils/useDictation.js'
import Icon from './Icons.jsx'

const ROUND_OPTIONS = [
  ['all', 'Any round'],
  ['first', 'Round 1 / L1'],
  ['second', 'Round 2 / L2'],
  ['final', 'Round 3 / Manager'],
]
const COUNTS = [5, 10, 15, 20]
const SECONDS = [30, 60, 90, 120]

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.value = 0.08
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
    setTimeout(() => ctx.close(), 600)
  } catch {
    /* ignore */
  }
}

const isRealQuestion = (q) => q.text.length >= 18 && !/^any (question|quer)/i.test(q.text)

function Chips({ options, value, onChange }) {
  return (
    <div className="chips">
      {options.map(([id, label]) => (
        <button key={id} className={`chip ${value === id ? 'is-on' : ''}`} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'is-disabled' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__ui" aria-hidden="true" />
      <span className="toggle__text">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

/* ============================ SETUP ============================ */
function Setup({ onStart }) {
  const { speech } = useApp()
  const dictSupported = useDictation().supported
  const [cfg, setCfg] = useState({
    industry: 'all',
    round: 'all',
    tag: 'all',
    count: 10,
    seconds: 60,
    aloud: true,
    voice: true,
    autoNext: true,
    record: false,
  })
  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v }))

  const pool = useMemo(
    () =>
      questions.filter(
        (q) =>
          isRealQuestion(q) &&
          (cfg.industry === 'all' || q.industry === cfg.industry) &&
          (cfg.round === 'all' || q.roundKind === cfg.round) &&
          (cfg.tag === 'all' || q.tags.includes(cfg.tag)),
      ),
    [cfg.industry, cfg.round, cfg.tag],
  )
  const n = Math.min(cfg.count, pool.length)

  return (
    <main className="page page--narrow">
      <h1 className="page-title">
        <Icon name="timer" size={28} /> Mock interview
      </h1>
      <p className="page-sub">
        Random questions, read aloud, with a countdown for your answer. Pick what you want to be asked.
      </p>

      <section className="panel">
        <h2>Industry</h2>
        <Chips
          value={cfg.industry}
          onChange={set('industry')}
          options={[['all', 'All industries'], ...industries.map((i) => [i.id, i.title])]}
        />
        <h2>Interview round</h2>
        <Chips value={cfg.round} onChange={set('round')} options={ROUND_OPTIONS} />
        <h2>Topic</h2>
        <div className="chips chips--scroll">
          {[['all', 'Any topic'], ...TAGS.map((t) => [t.id, t.label])].map(([id, label]) => (
            <button key={id} className={`chip ${cfg.tag === id ? 'is-on' : ''}`} onClick={() => set('tag')(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="panel__cols">
          <div>
            <h2>Questions</h2>
            <Chips value={cfg.count} onChange={set('count')} options={COUNTS.map((c) => [c, String(c)])} />
          </div>
          <div>
            <h2>Time per answer</h2>
            <Chips value={cfg.seconds} onChange={set('seconds')} options={SECONDS.map((s) => [s, `${s}s`])} />
          </div>
        </div>

        <h2>Options</h2>
        <Toggle checked={cfg.aloud && speech.supported} disabled={!speech.supported} onChange={set('aloud')} label="Read each question aloud" hint="The timer starts after the question has been read." />
        <Toggle
          checked={cfg.voice && dictSupported}
          disabled={!dictSupported}
          onChange={set('voice')}
          label="Transcribe my spoken answer"
          hint={dictSupported ? 'Needs the microphone (https or localhost).' : 'Not supported in this browser.'}
        />
        <Toggle checked={cfg.record && cfg.voice && dictSupported} disabled={!cfg.voice || !dictSupported} onChange={set('record')} label="Save my audio to listen back" hint="Optional – may not work on every phone." />
        <Toggle checked={cfg.autoNext} onChange={set('autoNext')} label="Move to the next question when time is up" />
      </section>

      <div className="mock-start">
        <span>
          {pool.length} matching questions · you will get <b>{n}</b>
        </span>
        <button
          className="btn btn--primary btn--lg"
          disabled={!n}
          onClick={() =>
            onStart(
              { ...cfg, aloud: cfg.aloud && speech.supported, voice: cfg.voice && dictSupported },
              shuffle(pool).slice(0, n),
            )
          }
        >
          <Icon name="shuffle" size={20} /> Start mock interview
        </button>
      </div>
    </main>
  )
}

/* ============================ TIMER RING ============================ */
function Ring({ left, total, phase }) {
  const R = 54
  const C = 2 * Math.PI * R
  const frac = phase === 'answering' || phase === 'timeup' ? left / total : 1
  const low = phase === 'answering' && left <= 10
  return (
    <div className={`ring ${low ? 'ring--low' : ''} ${phase === 'timeup' ? 'ring--end' : ''}`}>
      <svg viewBox="0 0 128 128" width="150" height="150" aria-hidden="true">
        <circle cx="64" cy="64" r={R} className="ring__bg" />
        <circle
          cx="64"
          cy="64"
          r={R}
          className="ring__fg"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="ring__label">
        <b>{phase === 'reading' ? <Icon name="speaker" size={30} /> : left}</b>
        <small>{phase === 'reading' ? 'listen' : phase === 'timeup' ? "time's up" : 'seconds'}</small>
      </div>
    </div>
  )
}

/* ============================ SESSION ============================ */
function Session({ cfg, deck, onRestart, onExit }) {
  const { speech, progress } = useApp()
  const dict = useDictation({ record: cfg.record })
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('reading') // reading | answering | timeup
  const [left, setLeft] = useState(cfg.seconds)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const results = useRef([])
  const token = useRef(0)
  const timeout = useRef(null)
  const speechRef = useRef(speech)
  const dictRef = useRef(dict)
  speechRef.current = speech
  dictRef.current = dict
  const leftRef = useRef(left)
  leftRef.current = left

  const q = deck[idx]

  const saveResult = () => {
    const d = dictRef.current
    const text = `${d.finalText} ${d.interim}`.trim()
    results.current[idx] = { q, answer: text, used: cfg.seconds - leftRef.current, audio: d.audioUrl }
  }

  const finish = () => {
    clearTimeout(timeout.current)
    token.current += 1
    speechRef.current.stop()
    dictRef.current.stop()
    setDone(true)
  }

  const next = () => {
    clearTimeout(timeout.current)
    saveResult()
    speechRef.current.stop()
    dictRef.current.stop()
    if (idx + 1 >= deck.length) finish()
    else setIdx(idx + 1)
  }

  // ---- start of each question: read it aloud, then begin the countdown ----
  useEffect(() => {
    if (done) return undefined
    const my = (token.current += 1)
    setPhase('reading')
    setLeft(cfg.seconds)
    setPaused(false)
    dictRef.current.reset()
    if (cfg.aloud) {
      Promise.resolve(speechRef.current.play(`mock-${idx}`, q.text)).then(() => {
        if (token.current === my) setPhase('answering')
      })
    } else {
      setPhase('answering')
    }
    return () => clearTimeout(timeout.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done])

  // ---- microphone only while it is the candidate's turn ----
  useEffect(() => {
    if (phase === 'answering' && cfg.voice && !paused) dictRef.current.start()
    return () => dictRef.current.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused])

  // ---- countdown ----
  useEffect(() => {
    if (phase !== 'answering' || paused) return undefined
    const id = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(id)
  }, [phase, paused])

  useEffect(() => {
    if (phase === 'answering' && left <= 0) {
      setPhase('timeup')
      beep()
      saveResult()
      if (cfg.autoNext) timeout.current = setTimeout(() => next(), 2200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase])

  useEffect(
    () => () => {
      clearTimeout(timeout.current)
      token.current += 1
      speechRef.current.stop()
    },
    [],
  )

  const skipReading = () => {
    token.current += 1
    speechRef.current.stop()
    setPhase('answering')
  }

  /* ---------- summary ---------- */
  if (done) {
    const list = results.current.filter(Boolean)
    const answered = list.filter((r) => r.answer).length
    const mins = Math.round(list.reduce((a, r) => a + r.used, 0) / 60)
    return (
      <main className="page page--narrow">
        <div className="summary-hero">
          <Icon name="trophy" size={44} />
          <h1>Session complete!</h1>
          <p>Nice work — every mock round makes the real one easier.</p>
        </div>
        <section className="stat-row">
          <div className="stat">
            <b>{list.length}</b>
            <span>Questions</span>
          </div>
          <div className="stat">
            <b>{cfg.voice ? answered : '–'}</b>
            <span>Spoken answers</span>
          </div>
          <div className="stat">
            <b>{mins || '<1'}</b>
            <span>Minutes</span>
          </div>
        </section>

        <div className="qlist qlist--tight">
          {list.map((r, i) => (
            <article key={r.q.id} className="qcard">
              <div className="qcard__main">
                <span className="qcard__num">{i + 1}</span>
                <div className="qcard__body">
                  <span className="qcard__company">
                    {r.q.companyName} · {r.q.roundName}
                  </span>
                  <p className="qcard__text">{r.q.text}</p>
                  {cfg.voice && (
                    <div className="vpanel__text">
                      <small>Your answer · {r.used}s</small>
                      <p>{r.answer || 'No answer captured.'}</p>
                    </div>
                  )}
                  {r.audio && <audio className="vpanel__audio" controls src={r.audio} />}
                </div>
              </div>
              <div className="qcard__actions">
                <button
                  className={`act act--star ${progress.isStarred(r.q.id) ? 'act--on' : ''}`}
                  onClick={() => progress.toggleStar(r.q.id)}
                >
                  <Icon name={progress.isStarred(r.q.id) ? 'starFill' : 'star'} size={17} />
                  <span>{progress.isStarred(r.q.id) ? 'Starred' : 'Star to revise'}</span>
                </button>
                {r.answer && (
                  <button className="act" onClick={() => progress.saveAnswer(r.q.id, r.answer)}>
                    <Icon name="check" size={17} />
                    <span>Save answer</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mock-start">
          <button className="btn btn--ghost" onClick={onExit}>
            Change settings
          </button>
          <button className="btn btn--primary" onClick={onRestart}>
            <Icon name="shuffle" size={18} /> New random set
          </button>
        </div>
      </main>
    )
  }

  /* ---------- live question ---------- */
  const text = `${dict.finalText} ${dict.interim}`.trim()
  const label =
    phase === 'reading' ? 'Listen to the question…' : phase === 'timeup' ? "Time's up!" : paused ? 'Paused' : 'Your turn — answer now'

  return (
    <main className="page page--narrow mock-live">
      <div className="mock-top">
        <button className="btn btn--ghost btn--sm" onClick={finish}>
          <Icon name="close" size={16} /> End
        </button>
        <span className="mock-top__count">
          Question <b>{idx + 1}</b> of {deck.length}
        </span>
        <button
          className={`btn btn--ghost btn--sm act--star ${progress.isStarred(q.id) ? 'act--on' : ''}`}
          onClick={() => progress.toggleStar(q.id)}
          aria-label="Star this question"
        >
          <Icon name={progress.isStarred(q.id) ? 'starFill' : 'star'} size={16} />
        </button>
      </div>
      <div className="pbar__track">
        <div className="pbar__fill" style={{ width: `${((idx + (phase === 'timeup' ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <section className="mock-card">
        <span className="qcard__company">
          {q.companyName} · {q.roundName}
        </span>
        <p className="mock-card__q">{q.text}</p>
      </section>

      <div className="mock-ring">
        <Ring left={Math.max(left, 0)} total={cfg.seconds} phase={phase} />
        <p className={`mock-state ${phase === 'timeup' ? 'is-end' : ''}`}>{label}</p>
      </div>

      {cfg.voice && (
        <div className="vpanel vpanel--mock">
          <div className="vpanel__info">
            <b>
              {dict.listening && (
                <span className="rec-dot" aria-hidden="true" />
              )}
              {dict.listening ? 'Listening' : 'Microphone off'}
            </b>
            <span>{text ? text.split(/\s+/).length : 0} words</span>
          </div>
          <div className="vpanel__text">
            <p>
              {text ? (
                <>
                  {dict.finalText} <span className="interim">{dict.interim}</span>
                </>
              ) : (
                <span className="interim">Your words will appear here as you speak…</span>
              )}
            </p>
          </div>
          {dict.error && <p className="notice">{dict.error}</p>}
        </div>
      )}

      <div className="mock-controls">
        {phase === 'reading' ? (
          <button className="btn btn--ghost" onClick={skipReading}>
            Skip reading
          </button>
        ) : (
          <button className="btn btn--ghost" onClick={() => setPaused((p) => !p)} disabled={phase === 'timeup'}>
            <Icon name={paused ? 'play' : 'pause'} size={18} /> {paused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button className="btn btn--primary" onClick={next}>
          {idx + 1 >= deck.length ? 'Finish' : 'Next question'} <Icon name="right" size={18} />
        </button>
      </div>
    </main>
  )
}

/* ============================ PAGE ============================ */
export default function MockPage() {
  const [session, setSession] = useState(null) // { cfg, deck, key }

  if (!session) {
    return <Setup onStart={(cfg, deck) => setSession({ cfg, deck, key: Date.now() })} />
  }
  const restart = () => {
    const { cfg } = session
    const pool = questions.filter(
      (q) =>
        isRealQuestion(q) &&
        (cfg.industry === 'all' || q.industry === cfg.industry) &&
        (cfg.round === 'all' || q.roundKind === cfg.round) &&
        (cfg.tag === 'all' || q.tags.includes(cfg.tag)),
    )
    setSession({ cfg, deck: shuffle(pool).slice(0, Math.min(cfg.count, pool.length)), key: Date.now() })
  }
  return <Session key={session.key} cfg={session.cfg} deck={session.deck} onRestart={restart} onExit={() => setSession(null)} />
}
