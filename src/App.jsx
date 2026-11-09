import { useEffect, useMemo, useState } from 'react'
import data from './data/questions.json'
import { useSpeech } from './utils/useSpeech.js'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import IndustryPage from './components/IndustryPage.jsx'
import CompanyPage from './components/CompanyPage.jsx'

function parseHash() {
  const [view = 'home', param = ''] = window.location.hash.replace(/^#\/?/, '').split('/')
  return { view: view || 'home', param: decodeURIComponent(param) }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const speech = useSpeech()
  const { stop } = speech

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // always stop audio when the page changes
  useEffect(() => {
    stop()
  }, [route.view, route.param, stop])

  const go = (path) => {
    window.location.hash = path
  }

  const byIndustry = useMemo(() => {
    const map = {}
    data.industries.forEach((i) => (map[i.id] = []))
    data.companies.forEach((c) => map[c.industry]?.push(c))
    return map
  }, [])

  const stats = useMemo(() => {
    const s = {}
    data.industries.forEach((i) => {
      const list = byIndustry[i.id]
      s[i.id] = {
        companies: list.length,
        questions: list.reduce((a, c) => a + c.rounds.reduce((b, r) => b + r.questions.length, 0), 0),
      }
    })
    return s
  }, [byIndustry])

  let content
  if (route.view === 'industry' && byIndustry[route.param]) {
    const industry = data.industries.find((i) => i.id === route.param)
    content = (
      <IndustryPage
        key={industry.id}
        industry={industry}
        companies={byIndustry[industry.id]}
        onOpen={(id) => go(`/company/${id}`)}
        onBack={() => go('/')}
      />
    )
  } else if (route.view === 'company' && data.companies.some((c) => c.id === route.param)) {
    const company = data.companies.find((c) => c.id === route.param)
    const industry = data.industries.find((i) => i.id === company.industry)
    const list = byIndustry[company.industry]
    const index = list.findIndex((c) => c.id === company.id)
    const goList = () => go(`/industry/${industry.id}`)
    content = (
      <CompanyPage
        key={company.id}
        company={company}
        industry={industry}
        index={index}
        total={list.length}
        prevName={list[index - 1]?.name}
        nextName={list[index + 1]?.name}
        speech={speech}
        onPrev={() => index > 0 && go(`/company/${list[index - 1].id}`)}
        onNext={() => (index < list.length - 1 ? go(`/company/${list[index + 1].id}`) : goList())}
        onBack={goList}
      />
    )
  } else {
    content = <Home industries={data.industries} stats={stats} onPick={(id) => go(`/industry/${id}`)} />
  }

  return (
    <>
      <Header onHome={() => go('/')} showHome={content.type !== Home} />
      {content}
      <footer className="footer">Built for Business Analyst interview practice · Questions are shown as collected</footer>
    </>
  )
}
