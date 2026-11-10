import { useMemo, useState } from 'react'
import { industries, topConcepts } from '../utils/catalog.js'
import { TAG_LABEL } from '../utils/topics.js'
import Icon from './Icons.jsx'
import QuestionCard from './QuestionCard.jsx'

export default function TopAsked() {
  const [industry, setIndustry] = useState(null)
  const [open, setOpen] = useState(topConcepts[0]?.id)
  const [more, setMore] = useState({})

  const list = useMemo(
    () =>
      topConcepts
        .map((c) => {
          const qs = industry ? c.questions.filter((q) => q.industry === industry) : c.questions
          return { ...c, questions: qs, companyCount: new Set(qs.map((q) => q.companyId)).size }
        })
        .filter((c) => c.companyCount >= (industry ? 1 : 2))
        .sort((a, b) => b.companyCount - a.companyCount || b.questions.length - a.questions.length),
    [industry],
  )
  const max = list[0]?.companyCount || 1

  return (
    <main className="page page--narrow">
      <h1 className="page-title">
        <Icon name="fire" size={28} /> Most asked topics
      </h1>
      <p className="page-sub">
        The same topics keep coming back in different words. They are ranked by how many different companies asked them —
        start your preparation from the top.
      </p>

      <div className="chips chips--scroll">
        <button className={`chip ${!industry ? 'is-on' : ''}`} onClick={() => setIndustry(null)}>
          All industries
        </button>
        {industries.map((i) => (
          <button key={i.id} className={`chip ${industry === i.id ? 'is-on' : ''}`} onClick={() => setIndustry(industry === i.id ? null : i.id)}>
            {i.title}
          </button>
        ))}
      </div>

      <ol className="toplist">
        {list.map((c, i) => {
          const isOpen = open === c.id
          const shown = more[c.id] ? c.questions : c.questions.slice(0, 5)
          return (
            <li key={c.id} className={`topitem ${isOpen ? 'is-open' : ''}`}>
              <button className="topitem__head" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
                <span className="topitem__rank">{i + 1}</span>
                <span className="topitem__body">
                  <b>{c.label}</b>
                  <span className="topitem__meta">
                    Asked by {c.companyCount} {c.companyCount === 1 ? 'company' : 'companies'} · {c.questions.length} questions ·{' '}
                    {TAG_LABEL[c.tag]}
                  </span>
                  <span className="topitem__bar">
                    <i style={{ width: `${(c.companyCount / max) * 100}%` }} />
                  </span>
                </span>
                <Icon name={isOpen ? 'close' : 'right'} size={18} />
              </button>
              {isOpen && (
                <div className="topitem__list">
                  {shown.map((q) => (
                    <QuestionCard key={q.id} q={q} showCompany showTags={false} label={<Icon name="chat" size={15} />} />
                  ))}
                  {c.questions.length > 5 && !more[c.id] && (
                    <button className="btn btn--ghost btn--sm" onClick={() => setMore((m) => ({ ...m, [c.id]: true }))}>
                      Show all {c.questions.length} questions
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </main>
  )
}
