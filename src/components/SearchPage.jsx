import { useMemo, useState } from 'react'
import { useApp } from '../context.jsx'
import { industries, companyById } from '../utils/catalog.js'
import { searchQuestions } from '../utils/search.js'
import { TAGS, TAG_LABEL } from '../utils/topics.js'
import Icon from './Icons.jsx'
import QuestionCard from './QuestionCard.jsx'

const PAGE = 40

/** Search across every company. Also used for "Browse by topic" (initialTag). */
export default function SearchPage({ initialQuery = '', initialTag = null }) {
  const { go } = useApp()
  const [query, setQuery] = useState(initialQuery)
  const [tag, setTag] = useState(initialTag)
  const [industry, setIndustry] = useState(null)
  const [limit, setLimit] = useState(PAGE)

  const results = useMemo(() => searchQuestions(query, { tag, industry }), [query, tag, industry])
  const companyIds = useMemo(() => [...new Set(results.map((q) => q.companyId))], [results])
  const hasFilter = query.trim() || tag || industry

  return (
    <main className="page page--narrow">
      <h1 className="page-title">{initialTag && !query ? TAG_LABEL[initialTag] : 'Search all questions'}</h1>
      <p className="page-sub">One search across every company. Try “RTM”, “SQL joins”, “conflicting stakeholders”.</p>

      <div className="searchbar searchbar--sticky">
        <Icon name="search" size={20} />
        <input
          autoFocus={!initialTag}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLimit(PAGE)
          }}
          placeholder="Search questions…"
          aria-label="Search questions"
        />
        {query && (
          <button className="searchbar__clear" onClick={() => setQuery('')} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <div className="filters">
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
        <div className="chips chips--scroll">
          {TAGS.map((t) => (
            <button
              key={t.id}
              className={`chip chip--tag ${tag === t.id ? 'is-on' : ''}`}
              onClick={() => {
                setTag(tag === t.id ? null : t.id)
                setLimit(PAGE)
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count">
        <b>{results.length.toLocaleString()}</b> {results.length === 1 ? 'question' : 'questions'}
        {hasFilter && companyIds.length > 0 && (
          <>
            {' '}
            asked by <b>{companyIds.length}</b> {companyIds.length === 1 ? 'company' : 'companies'}
          </>
        )}
      </p>

      {hasFilter && companyIds.length > 0 && companyIds.length <= 24 && (
        <div className="chips">
          {companyIds.map((id) => (
            <button key={id} className="chip chip--company" onClick={() => go(`/company/${id}`)}>
              {companyById[id].name}
            </button>
          ))}
        </div>
      )}

      <div className="qlist qlist--tight">
        {results.slice(0, limit).map((q) => (
          <QuestionCard key={q.id} q={q} showCompany label={<Icon name="chat" size={15} />} />
        ))}
        {results.length === 0 && <p className="empty">No questions found. Try fewer or different words.</p>}
        {results.length > limit && (
          <button className="btn btn--ghost" onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({results.length - limit} left)
          </button>
        )}
      </div>
    </main>
  )
}
