import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './context.jsx'
import { companyById, industryById } from './utils/catalog.js'
import { TAG_LABEL } from './utils/topics.js'
import { useSpeech } from './utils/useSpeech.js'
import { useProgressStore } from './utils/progress.js'
import { useTheme } from './utils/useTheme.js'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import IndustryPage from './components/IndustryPage.jsx'
import CompanyPage from './components/CompanyPage.jsx'
import SearchPage from './components/SearchPage.jsx'
import TopAsked from './components/TopAsked.jsx'
import MockPage from './components/MockPage.jsx'
import MyPractice from './components/MyPractice.jsx'

function parseHash() {
  const [view = 'home', ...rest] = window.location.hash.replace(/^#\/?/, '').split('/')
  let param = ''
  try {
    param = decodeURIComponent(rest.join('/'))
  } catch {
    param = rest.join('/')
  }
  return { view: view || 'home', param }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const speech = useSpeech()
  const progress = useProgressStore()
  const { theme, toggle } = useTheme()
  const [micOwner, setMicOwner] = useState(null)
  const { stop } = speech

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // audio always stops when the page changes
  useEffect(() => {
    stop()
    setMicOwner(null)
  }, [route.view, route.param, stop])

  const go = useCallback((path) => {
    window.location.hash = `#${path}`
  }, [])

  const ctx = useMemo(
    () => ({ speech, progress, go, micOwner, claimMic: setMicOwner }),
    [speech, progress, go, micOwner],
  )

  let content
  const { view, param } = route
  if (view === 'industry' && industryById[param]) content = <IndustryPage key={param} industryId={param} />
  else if (view === 'company' && companyById[param]) content = <CompanyPage key={param} companyId={param} />
  else if (view === 'search') content = <SearchPage key={`s-${param}`} initialQuery={param} />
  else if (view === 'topic' && TAG_LABEL[param]) content = <SearchPage key={`t-${param}`} initialTag={param} />
  else if (view === 'top') content = <TopAsked />
  else if (view === 'mock') content = <MockPage />
  else if (view === 'mine') content = <MyPractice />
  else content = <Home />

  return (
    <AppContext.Provider value={ctx}>
      <Header view={view} go={go} theme={theme} onToggleTheme={toggle} />
      {content}
      <footer className="footer">Built for Business Analyst interview practice · Your progress is saved only in this browser</footer>
    </AppContext.Provider>
  )
}
