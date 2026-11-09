import { useEffect, useMemo, useState } from 'react'
import Icon from './Icons.jsx'

const SPEEDS = [
  { label: '0.8×', value: 0.8 },
  { label: '1×', value: 1 },
  { label: '1.2×', value: 1.2 },
]

function Equalizer() {
  return (
    <span className="eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

function QuestionCard({ item, speech }) {
  const isActive = speech.activeId === item.id
  return (
    <article id={item.id} className={`qcard ${isActive ? 'qcard--active' : ''}`}>
      <span className="qcard__num">{item.n}</span>
      <div className="qcard__body">
        <p className="qcard__text">{item.text}</p>
        {isActive && (
          <span className="qcard__playing">
            <Equalizer /> Now playing
          </span>
        )}
      </div>
      {speech.supported && (
        <button
          className={`play-btn ${isActive ? 'play-btn--on' : ''}`}
          onClick={() => speech.play(item.id, item.text)}
          aria-label={isActive ? 'Stop audio' : 'Play audio for this question'}
          title={isActive ? 'Stop audio' : 'Play audio'}
        >
          <Icon name={isActive ? 'stop' : 'play'} size={isActive ? 18 : 20} />
        </button>
      )}
    </article>
  )
}

export default function CompanyPage({
  company,
  industry,
  index,
  total,
  prevName,
  nextName,
  speech,
  onPrev,
  onNext,
  onBack,
}) {
  const [tab, setTab] = useState('all')
  const [showVoices, setShowVoices] = useState(false)

  const sections = useMemo(
    () =>
      company.rounds.map((r, ri) => ({
        name: r.name,
        ri,
        items: r.questions.map((text, qi) => ({ id: `${company.id}__${ri}_${qi}`, text, n: qi + 1 })),
      })),
    [company],
  )

  const visible = tab === 'all' ? sections : sections.filter((s) => s.ri === tab)
  const playlist = useMemo(() => visible.flatMap((s) => s.items), [visible])
  const totalQuestions = sections.reduce((a, s) => a + s.items.length, 0)
  const isLast = index === total - 1
  const playingAll = speech.mode === 'all'

  // keep the question being read in view
  useEffect(() => {
    if (speech.mode === 'all' && speech.activeId) {
      document.getElementById(speech.activeId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [speech.activeId, speech.mode])

  const changeTab = (t) => {
    speech.stop()
    setTab(t)
  }

  return (
    <main className={`page page--company accent-${industry.id}`}>
      <button className="btn btn--ghost btn--sm back" onClick={onBack}>
        <Icon name="left" size={18} /> {industry.title}
      </button>

      <section className="company-head">
        <div className="company-head__top">
          <span className="company-head__avatar">{company.name.trim()[0].toUpperCase()}</span>
          <div>
            <span className="badge">
              <Icon name={industry.icon} size={14} /> {industry.title}
            </span>
            <h1>{company.name}</h1>
          </div>
        </div>
        <div className="company-head__meta">
          <span>
            <Icon name="building" size={16} /> Company {index + 1} of {total}
          </span>
          <span>
            <Icon name="chat" size={16} /> {totalQuestions} questions
          </span>
          <span>
            <Icon name="layers" size={16} /> {sections.length} {sections.length === 1 ? 'round' : 'rounds'}
          </span>
        </div>
      </section>

      {/* ---- audio toolbar ---- */}
      <section className="audiobar" aria-label="Audio controls">
        {speech.supported ? (
          <>
            <div className="audiobar__row">
              {playingAll ? (
                <button className="btn btn--danger" onClick={speech.stop}>
                  <Icon name="stop" size={18} /> Stop
                </button>
              ) : (
                <button className="btn btn--primary" onClick={() => speech.playAll(playlist)}>
                  <Icon name="speaker" size={18} /> Play all ({playlist.length})
                </button>
              )}

              <div className="seg" role="group" aria-label="Speech speed">
                {SPEEDS.map((s) => (
                  <button
                    key={s.value}
                    className={`seg__btn ${speech.rate === s.value ? 'is-on' : ''}`}
                    onClick={() => speech.setRate(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                className={`btn btn--ghost btn--icon ${showVoices ? 'is-on' : ''}`}
                onClick={() => setShowVoices((v) => !v)}
                aria-label="Voice settings"
                aria-expanded={showVoices}
                title="Choose voice"
              >
                <Icon name="sliders" size={20} />
              </button>
            </div>

            {showVoices && (
              <label className="voice-select">
                <span>Voice</span>
                <select value={speech.voiceURI} onChange={(e) => speech.chooseVoice(e.target.value)}>
                  {speech.voices.length === 0 && <option value="">Default voice</option>}
                  {speech.voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        ) : (
          <p className="notice">Audio is not supported in this browser. Please try Chrome, Edge or Safari.</p>
        )}
      </section>

      {/* ---- round tabs ---- */}
      {sections.length > 1 && (
        <nav className="tabs" aria-label="Interview rounds">
          <button className={`tab ${tab === 'all' ? 'is-on' : ''}`} onClick={() => changeTab('all')}>
            All rounds
          </button>
          {sections.map((s) => (
            <button key={s.ri} className={`tab ${tab === s.ri ? 'is-on' : ''}`} onClick={() => changeTab(s.ri)}>
              {s.name}
              <em>{s.items.length}</em>
            </button>
          ))}
        </nav>
      )}

      {/* ---- questions ---- */}
      <div className="qlist">
        {visible.map((s) => (
          <section key={s.ri} className="qsection">
            {(sections.length > 1 || s.name !== 'Interview Questions') && (
              <h2 className="qsection__title">
                {s.name}
                <span>{s.items.length} questions</span>
              </h2>
            )}
            {s.items.map((item) => (
              <QuestionCard key={item.id} item={item} speech={speech} />
            ))}
          </section>
        ))}
      </div>

      {/* ---- prev / next company ---- */}
      <nav className="company-nav" aria-label="Company navigation">
        <div className="company-nav__inner">
          <button className="navbtn navbtn--prev" onClick={onPrev} disabled={index === 0}>
            <Icon name="left" size={20} />
            <span>
              <small>Previous</small>
              <b>{prevName || '—'}</b>
            </span>
          </button>
          <button className="navbtn navbtn--next" onClick={onNext}>
            <span>
              <small>{isLast ? 'You reached the end' : 'Next company'}</small>
              <b>{isLast ? 'Back to all companies' : nextName}</b>
            </span>
            <Icon name="right" size={20} />
          </button>
        </div>
      </nav>
    </main>
  )
}
