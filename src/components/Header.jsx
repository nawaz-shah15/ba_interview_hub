import Icon from './Icons.jsx'

export default function Header({ onHome, showHome }) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <button className="brand" onClick={onHome} aria-label="Go to home">
          <span className="brand__logo">
            <Icon name="chat" size={20} strokeWidth={2.2} />
          </span>
          <span className="brand__text">
            BA Interview <b>Hub</b>
          </span>
        </button>
        {showHome && (
          <button className="btn btn--ghost btn--sm" onClick={onHome}>
            <Icon name="home" size={18} />
            <span>Home</span>
          </button>
        )}
      </div>
    </header>
  )
}
