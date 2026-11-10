import { useState } from 'react'
import { useApp } from '../context.jsx'
import { TAG_LABEL } from '../utils/topics.js'
import Icon from './Icons.jsx'
import VoicePanel from './VoicePanel.jsx'

function Equalizer() {
  return (
    <span className="eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

/** One interview question with listen, practise, star and "prepared" actions. */
export default function QuestionCard({ q, label, showCompany = false, showTags = true }) {
  const { speech, progress, go } = useApp()
  const [open, setOpen] = useState(false)
  const active = speech.activeId === q.id
  const starred = progress.isStarred(q.id)
  const prepared = progress.isPrepared(q.id)
  const hasAnswer = !!progress.answers[q.id]

  return (
    <article id={q.id} className={`qcard ${active ? 'qcard--active' : ''} ${prepared ? 'qcard--done' : ''}`}>
      <div className="qcard__main">
        <span className="qcard__num">{label ?? q.n}</span>
        <div className="qcard__body">
          {showCompany && (
            <button className="qcard__company" onClick={() => go(`/company/${q.companyId}`)}>
              {q.companyName} · {q.roundName}
            </button>
          )}
          <p className="qcard__text">{q.text}</p>
          {showTags && (
            <div className="qcard__tags">
              {q.tags.slice(0, 3).map((t) => (
                <button key={t} className="mini-tag" onClick={() => go(`/topic/${t}`)}>
                  {TAG_LABEL[t]}
                </button>
              ))}
            </div>
          )}
          {active && (
            <span className="qcard__playing">
              <Equalizer /> Now playing
            </span>
          )}
        </div>
      </div>

      <div className="qcard__actions">
        {speech.supported && (
          <button
            className={`act ${active ? 'act--on' : ''}`}
            onClick={() => speech.play(q.id, q.text)}
            aria-label={active ? 'Stop audio' : 'Play audio for this question'}
          >
            <Icon name={active ? 'stop' : 'play'} size={active ? 16 : 17} />
            <span>{active ? 'Stop' : 'Listen'}</span>
          </button>
        )}
        <button className={`act ${open ? 'act--on' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon name="mic" size={17} />
          <span>Answer{hasAnswer ? ' ●' : ''}</span>
        </button>
        <button
          className={`act act--star ${starred ? 'act--on' : ''}`}
          onClick={() => progress.toggleStar(q.id)}
          aria-pressed={starred}
          aria-label={starred ? 'Remove bookmark' : 'Bookmark as hard'}
        >
          <Icon name={starred ? 'starFill' : 'star'} size={17} />
          <span>{starred ? 'Starred' : 'Star'}</span>
        </button>
        <button
          className={`act act--done ${prepared ? 'act--on' : ''}`}
          onClick={() => progress.togglePrepared(q.id)}
          aria-pressed={prepared}
        >
          <Icon name={prepared ? 'checkCircle' : 'check'} size={17} />
          <span>{prepared ? 'Prepared' : 'Mark prepared'}</span>
        </button>
      </div>

      {open && <VoicePanel q={q} />}
    </article>
  )
}
