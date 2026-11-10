import { useState } from 'react'
import Icon from './Icons.jsx'

const NAV = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'search', label: 'Search', icon: 'search', path: '/search/' },
  { id: 'top', label: 'Most asked', icon: 'fire', path: '/top' },
  { id: 'mock', label: 'Mock interview', icon: 'timer', path: '/mock' },
  { id: 'mine', label: 'My practice', icon: 'user', path: '/mine' },
]

const groupOf = (view) => {
  if (view === 'industry' || view === 'company') return 'home'
  if (view === 'topic') return 'search'
  return view
}

export default function Header({ view, go, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const current = groupOf(view)
  const nav = (path) => {
    setOpen(false)
    go(path)
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <button className="brand" onClick={() => nav('/')} aria-label="Go to home">
          <span className="brand__logo">
            <Icon name="chat" size={20} strokeWidth={2.2} />
          </span>
          <span className="brand__text">
            BA Interview <b>Hub</b>
          </span>
        </button>

        <nav className="topnav" aria-label="Main">
          {NAV.map((n) => (
            <button key={n.id} className={`topnav__link ${current === n.id ? 'is-on' : ''}`} onClick={() => nav(n.path)}>
              <Icon name={n.icon} size={17} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="topbar__tools">
          <button
            className="iconbtn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
          <button className="iconbtn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          {NAV.map((n) => (
            <button key={n.id} className={`mobile-menu__item ${current === n.id ? 'is-on' : ''}`} onClick={() => nav(n.path)}>
              <Icon name={n.icon} size={20} />
              {n.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
