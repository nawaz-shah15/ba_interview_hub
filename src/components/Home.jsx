import Icon from './Icons.jsx'

export default function Home({ industries, stats, onPick }) {
  const totalCompanies = Object.values(stats).reduce((a, s) => a + s.companies, 0)
  const totalQuestions = Object.values(stats).reduce((a, s) => a + s.questions, 0)

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
          Choose your industry, pick a company and practise the exact questions that were asked. Tap the speaker to hear
          any question read out loud.
        </p>
        <div className="hero__stats">
          <div>
            <b>{totalCompanies}</b>
            <span>Companies</span>
          </div>
          <div>
            <b>{totalQuestions.toLocaleString()}</b>
            <span>Questions</span>
          </div>
          <div>
            <b>3</b>
            <span>Industries</span>
          </div>
        </div>
      </section>

      <h2 className="section-title">Choose your industry</h2>
      <section className="industry-grid">
        {industries.map((ind) => (
          <button key={ind.id} className={`industry-card accent-${ind.id}`} onClick={() => onPick(ind.id)}>
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
    </main>
  )
}
