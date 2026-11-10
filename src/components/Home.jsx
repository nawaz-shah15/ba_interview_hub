import { useState } from 'react'
import { useApp } from '../context.jsx'
import { industries, companies, questions } from '../utils/catalog.js'
import { TAGS } from '../utils/topics.js'
import Icon from './Icons.jsx'
import ProgressBar from './ProgressBar.jsx'

export default function Home() {
  const { go, progress } = useApp()
  const [q, setQ] = useState('')

  const stats = {}
  industries.forEach((i) => {
    const list = companies.filter((c) => c.industry === i.id)
    stats[i.id] = { companies: list.length, questions: questions.filter((x) => x.industry === i.id).length }
  })
  const prepared = progress.countPrepared(questions)
  const starred = progress.countStarred(questions)

  const submit = (e) => {
    e.preventDefault()
    go(`/search/${encodeURIComponent(q.trim())}`)
  }

  return (
    <main className="page">
      <section className="hero">
        <span className="pill">Business Analyst · Interview Preparation</span>
        <h1>
          Real interview questions,
          <br />
          <span className="grad-text">company by company.</span>
        </h1>
        <p className="hero__sub">
          Practise the exact questions that were asked. Listen to them, answer out loud, run a timed mock interview and
          track what you have prepared.
        </p>

        <form className="searchbar searchbar--hero" onSubmit={submit} role="search">
          <Icon name="search" size={20} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${questions.length.toLocaleString()} questions — try “RTM” or “SQL joins”`}
            aria-label="Search all questions"
          />
          <button className="btn btn--primary btn--sm" type="submit">
            Search
          </button>
        </form>

        <div className="hero__stats">
          <div>
            <b>{companies.length}</b>
            <span>Companies</span>
          </div>
          <div>
            <b>{questions.length.toLocaleString()}</b>
            <span>Questions</span>
          </div>
          <div>
            <b>{prepared}</b>
            <span>Prepared</span>
          </div>
        </div>
      </section>

      <h2 className="section-title">Choose your industry</h2>
      <section className="industry-grid">
        {industries.map((ind) => (
          <button key={ind.id} className={`industry-card accent-${ind.id}`} onClick={() => go(`/industry/${ind.id}`)}>
            <span className="industry-card__icon">
              <Icon name={ind.icon} size={30} />
            </span>
            <span className="industry-card__title">{ind.title}</span>
            <span className="industry-card__tag">{ind.tagline}</span>
            <span className="industry-card__meta">
              <span>
                <b>{stats[ind.id].companies}</b> companies
              </span>
              <span>
                <b>{stats[ind.id].questions}</b> questions
              </span>
            </span>
            <span className="industry-card__go">
              Explore <Icon name="arrow" size={18} />
            </span>
          </button>
        ))}
      </section>

      <h2 className="section-title">Practise smarter</h2>
      <section className="tool-grid">
        <button className="tool-card" onClick={() => go('/mock')}>
          <span className="tool-card__icon tool-card__icon--a">
            <Icon name="timer" size={24} />
          </span>
          <b>Mock interview</b>
          <span>Random questions read aloud with a countdown timer.</span>
        </button>
        <button className="tool-card" onClick={() => go('/top')}>
          <span className="tool-card__icon tool-card__icon--b">
            <Icon name="fire" size={24} />
          </span>
          <b>Most asked topics</b>
          <span>See what repeats across companies and prepare it first.</span>
        </button>
        <button className="tool-card" onClick={() => go('/mine')}>
          <span className="tool-card__icon tool-card__icon--c">
            <Icon name="star" size={24} />
          </span>
          <b>My practice</b>
          <span>
            {starred} starred · {prepared} prepared · saved answers
          </span>
        </button>
      </section>

      <div className="home-progress">
        <b>Your overall progress</b>
        <ProgressBar value={prepared} total={questions.length} />
      </div>

      <h2 className="section-title">Browse by topic</h2>
      <div className="chips">
        {TAGS.map((t) => (
          <button key={t.id} className="chip" onClick={() => go(`/topic/${t.id}`)}>
            <Icon name="tag" size={15} /> {t.label}
          </button>
        ))}
      </div>
    </main>
  )
}
