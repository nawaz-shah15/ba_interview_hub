import { useMemo, useState } from 'react'
import Icon from './Icons.jsx'

export default function IndustryPage({ industry, companies, onOpen, onBack }) {
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return term ? companies.filter((c) => c.name.toLowerCase().includes(term)) : companies
  }, [q, companies])

  return (
    <main className={`page accent-${industry.id}`}>
      <button className="btn btn--ghost btn--sm back" onClick={onBack}>
        <Icon name="left" size={18} /> All industries
      </button>

      <section className="industry-head">
        <span className="industry-head__icon">
          <Icon name={industry.icon} size={30} />
        </span>
        <div>
          <h1>{industry.title}</h1>
          <p>{industry.tagline}</p>
        </div>
      </section>

      <div className="searchbar">
        <Icon name="search" size={20} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${companies.length} companies…`}
          aria-label="Search companies"
        />
        {q && (
          <button className="searchbar__clear" onClick={() => setQ('')} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="empty">No company matches “{q}”.</p>
      ) : (
        <section className="company-grid">
          {list.map((c) => {
            const total = c.rounds.reduce((a, r) => a + r.questions.length, 0)
            return (
              <button key={c.id} className="company-card" onClick={() => onOpen(c.id)}>
                <span className="company-card__avatar">{c.name.trim()[0].toUpperCase()}</span>
                <span className="company-card__body">
                  <span className="company-card__name">{c.name}</span>
                  <span className="company-card__meta">
                    {total} questions · {c.rounds.length} {c.rounds.length === 1 ? 'round' : 'rounds'}
                  </span>
                </span>
                <Icon name="right" size={20} className="company-card__chev" />
              </button>
            )
          })}
        </section>
      )}
    </main>
  )
}
