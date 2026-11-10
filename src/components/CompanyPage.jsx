import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context.jsx'
import { companies, companyById, industryById, questionsByCompany } from '../utils/catalog.js'
import { TAGS } from '../utils/topics.js'
import Icon from './Icons.jsx'
import AudioBar from './AudioBar.jsx'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'

export default function CompanyPage({ companyId }) {
  const { go, speech, progress } = useApp()
  const company = companyById[companyId]
  const industry = industryById[company.industry]
  const list = useMemo(() => companies.filter((c) => c.industry === company.industry), [company.industry])
  const index = list.findIndex((c) => c.id === company.id)
  const isLast = index === list.length - 1
  const all = questionsByCompany[company.id]

  const [round, setRound] = useState('all')
  const [status, setStatus] = useState('all') // all | starred | todo
  const [tag, setTag] = useState(null)

  const rounds = company.rounds
  const tagsHere = useMemo(() => TAGS.filter((t) => all.some((q) => q.tags.includes(t.id))), [all])

  const visible = useMemo(
    () =>
      all.filter(
        (q) =>
          (round === 'all' || q.roundIndex === round) &&
          (!tag || q.tags.includes(tag)) &&
          (status === 'all' || (status === 'starred' ? progress.isStarred(q.id) : !progress.isPrepared(q.id))),
      ),
    [all, round, tag, status, progress],
  )
  const groups = useMemo(() => {
    const m = new Map()
    visible.forEach((q) => {
      if (!m.has(q.roundIndex)) m.set(q.roundIndex, [])
      m.get(q.roundIndex).push(q)
    })
    return [...m.entries()]
  }, [visible])

  const prepared = progress.countPrepared(all)
  const starred = progress.countStarred(all)

  useEffect(() => {
    if (speech.mode === 'all' && speech.activeId) {
      document.getElementById(speech.activeId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [speech.activeId, speech.mode])

  const pick = (setter) => (v) => {
    speech.stop()
    setter(v)
  }

  const goList = () => go(`/industry/${industry.id}`)

  return (
    <main className={`page page--company accent-${industry.id}`}>
      <button className="btn btn--ghost btn--sm back" onClick={goList}>
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
            <Icon name="building" size={16} /> Company {index + 1} of {list.length}
          </span>
          <span>
            <Icon name="chat" size={16} /> {all.length} questions
          </span>
          <span>
            <Icon name="layers" size={16} /> {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'}
          </span>
          <span>
            <Icon name="starFill" size={16} /> {starred} starred
          </span>
        </div>
        <ProgressBar value={prepared} total={all.length} />
      </section>

      <AudioBar items={visible.map((q) => ({ id: q.id, text: q.text }))} />

      {rounds.length > 1 && (
        <nav className="tabs" aria-label="Interview rounds">
          <button className={`tab ${round === 'all' ? 'is-on' : ''}`} onClick={() => pick(setRound)('all')}>
            All rounds
          </button>
          {rounds.map((r, ri) => (
            <button key={ri} className={`tab ${round === ri ? 'is-on' : ''}`} onClick={() => pick(setRound)(ri)}>
              {r.name}
              <em>{r.questions.length}</em>
            </button>
          ))}
        </nav>
      )}

      <div className="filters">
        <div className="chips chips--scroll" aria-label="Show">
          {[
            ['all', 'All'],
            ['starred', '★ Starred'],
            ['todo', 'Not prepared'],
          ].map(([id, label]) => (
            <button key={id} className={`chip ${status === id ? 'is-on' : ''}`} onClick={() => pick(setStatus)(id)}>
              {label}
            </button>
          ))}
        </div>
        {tagsHere.length > 1 && (
          <div className="chips chips--scroll" aria-label="Topics">
            {tagsHere.map((t) => (
              <button
                key={t.id}
                className={`chip chip--tag ${tag === t.id ? 'is-on' : ''}`}
                onClick={() => pick(setTag)(tag === t.id ? null : t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="qlist">
        {groups.length === 0 && <p className="empty">No questions match these filters.</p>}
        {groups.map(([ri, qs]) => (
          <section key={ri} className="qsection">
            {(rounds.length > 1 || rounds[ri].name !== 'Interview Questions') && (
              <h2 className="qsection__title">
                {rounds[ri].name}
                <span>{qs.length} questions</span>
              </h2>
            )}
            {qs.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </section>
        ))}
      </div>

      <nav className="company-nav" aria-label="Company navigation">
        <div className="company-nav__inner">
          <button
            className="navbtn navbtn--prev"
            onClick={() => index > 0 && go(`/company/${list[index - 1].id}`)}
            disabled={index === 0}
          >
            <Icon name="left" size={20} />
            <span>
              <small>Previous</small>
              <b>{list[index - 1]?.name || '—'}</b>
            </span>
          </button>
          <button
            className="navbtn navbtn--next"
            onClick={() => (isLast ? goList() : go(`/company/${list[index + 1].id}`))}
          >
            <span>
              <small>{isLast ? 'You reached the end' : 'Next company'}</small>
              <b>{isLast ? 'Back to all companies' : list[index + 1].name}</b>
            </span>
            <Icon name="right" size={20} />
          </button>
        </div>
      </nav>
    </main>
  )
}
