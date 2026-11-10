import { useMemo, useState } from 'react'
import { useApp } from '../context.jsx'
import { companies, questions, questionById, questionsByCompany } from '../utils/catalog.js'
import Icon from './Icons.jsx'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'

export default function MyPractice() {
  const { progress, go } = useApp()
  const [tab, setTab] = useState('starred')

  const starred = useMemo(() => questions.filter((q) => progress.starred[q.id]), [progress.starred])
  const answers = useMemo(
    () =>
      Object.entries(progress.answers)
        .map(([id, a]) => ({ q: questionById[id], a }))
        .filter((x) => x.q)
        .sort((x, y) => y.a.at - x.a.at),
    [progress.answers],
  )
  const prepared = progress.countPrepared(questions)

  const byCompany = useMemo(
    () =>
      companies
        .map((c) => {
          const qs = questionsByCompany[c.id]
          return { c, done: progress.countPrepared(qs), total: qs.length, stars: progress.countStarred(qs) }
        })
        .filter((x) => x.done || x.stars)
        .sort((a, b) => b.done / b.total - a.done / a.total),
    [progress],
  )

  const confirmReset = () => {
    if (window.confirm('Clear all bookmarks, prepared marks and saved answers on this device?')) progress.reset()
  }

  return (
    <main className="page page--narrow">
      <h1 className="page-title">
        <Icon name="user" size={28} /> My practice
      </h1>
      <p className="page-sub">Saved only in this browser. Nothing is uploaded anywhere.</p>

      <section className="stat-row">
        <div className="stat">
          <b>{prepared}</b>
          <span>Prepared</span>
        </div>
        <div className="stat">
          <b>{starred.length}</b>
          <span>Starred</span>
        </div>
        <div className="stat">
          <b>{answers.length}</b>
          <span>Answers saved</span>
        </div>
      </section>
      <ProgressBar value={prepared} total={questions.length} />

      <div className="chips" style={{ marginTop: 18 }}>
        {[
          ['starred', `★ Starred (${starred.length})`],
          ['answers', `Voice answers (${answers.length})`],
          ['companies', `By company (${byCompany.length})`],
        ].map(([id, label]) => (
          <button key={id} className={`chip ${tab === id ? 'is-on' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="qlist qlist--tight" style={{ marginTop: 16 }}>
        {tab === 'starred' &&
          (starred.length ? (
            starred.map((q) => <QuestionCard key={q.id} q={q} showCompany label={<Icon name="starFill" size={15} />} />)
          ) : (
            <p className="empty">No starred questions yet. Tap “Star” on any hard question to find it here.</p>
          ))}

        {tab === 'answers' &&
          (answers.length ? (
            answers.map(({ q, a }) => (
              <div key={q.id} className="answer-item">
                <QuestionCard q={q} showCompany showTags={false} label={<Icon name="mic" size={15} />} />
                <div className="vpanel__text">
                  <small>Your answer · {new Date(a.at).toLocaleDateString()}</small>
                  <p>{a.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">No voice answers yet. Tap “Answer” on a question and speak.</p>
          ))}

        {tab === 'companies' &&
          (byCompany.length ? (
            byCompany.map(({ c, done, total, stars }) => (
              <button key={c.id} className="company-card" onClick={() => go(`/company/${c.id}`)}>
                <span className="company-card__avatar">{c.name.trim()[0].toUpperCase()}</span>
                <span className="company-card__body">
                  <span className="company-card__name">{c.name}</span>
                  <span className="company-card__meta">
                    {done}/{total} prepared · {stars} starred
                  </span>
                  <ProgressBar value={done} total={total} label={false} small />
                </span>
                <Icon name="right" size={20} className="company-card__chev" />
              </button>
            ))
          ) : (
            <p className="empty">Mark questions as prepared and your company progress will show up here.</p>
          ))}
      </div>

      <button className="btn btn--ghost btn--sm reset-btn" onClick={confirmReset}>
        <Icon name="trash" size={16} /> Reset all my data
      </button>
    </main>
  )
}
