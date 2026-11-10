import { useMemo, useState } from 'react'
import { useApp } from '../context.jsx'
import { companies, industryById, questionsByCompany } from '../utils/catalog.js'
import Icon from './Icons.jsx'
import ProgressBar from './ProgressBar.jsx'

export default function IndustryPage({ industryId }) {
  const { go, progress } = useApp()
  const industry = industryById[industryId]
  const list = useMemo(() => companies.filter((c) => c.industry === industryId), [industryId])
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return term ? list.filter((c) => c.name.toLowerCase().includes(term)) : list
  }, [q, list])

  return (
    <main className={`page accent-${industry.id}`}>
      <button className="btn btn--ghost btn--sm back" onClick={() => go('/')}>
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
          placeholder={`Search ${list.length} companies…`}
          aria-label="Search companies"
        />
        {q && (
          <button className="searchbar__clear" onClick={() => setQ('')} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No company matches “{q}”.</p>
      ) : (
        <section className="company-grid">
          {shown.map((c) => {
            const qs = questionsByCompany[c.id]
            const done = progress.countPrepared(qs)
            return (
              <button key={c.id} className="company-card" onClick={() => go(`/company/${c.id}`)}>
                <span className="company-card__avatar">{c.name.trim()[0].toUpperCase()}</span>
                <span className="company-card__body">
                  <span className="company-card__name">{c.name}</span>
                  <span className="company-card__meta">
                    {qs.length} questions · {c.rounds.length} {c.rounds.length === 1 ? 'round' : 'rounds'}
                  </span>
                  {done > 0 && <ProgressBar value={done} total={qs.length} label={false} small />}
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
