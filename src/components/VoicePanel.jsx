import { useEffect, useState } from 'react'
import { useApp } from '../context.jsx'
import { useDictation } from '../utils/useDictation.js'
import Icon from './Icons.jsx'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** Practise answering a question out loud – the answer is transcribed on screen. */
export default function VoicePanel({ q }) {
  const { speech, progress, micOwner, claimMic } = useApp()
  const [record, setRecord] = useState(false)
  const d = useDictation({ record })
  const saved = progress.answers[q.id]
  const text = `${d.finalText} ${d.interim}`.trim()
  const words = text ? text.split(/\s+/).length : 0

  // only one question may use the microphone at a time
  useEffect(() => {
    if (micOwner !== q.id && d.listening) d.stop()
  }, [micOwner, q.id, d])

  // keep the latest transcript saved in the browser
  useEffect(() => {
    if (!d.listening && d.finalText) progress.saveAnswer(q.id, d.finalText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.listening, d.finalText])

  const toggle = () => {
    if (d.listening) {
      d.stop()
    } else {
      speech.stop()
      claimMic(q.id)
      d.reset()
      d.start()
    }
  }

  if (!d.supported) {
    return (
      <div className="vpanel">
        <p className="notice">
          Voice answers need a browser with speech recognition (Chrome, Edge or Safari). The page must also be opened on
          https:// or http://localhost for the microphone to work.
        </p>
      </div>
    )
  }

  return (
    <div className="vpanel">
      <div className="vpanel__top">
        <button
          className={`mic ${d.listening ? 'mic--on' : ''}`}
          onClick={toggle}
          aria-label={d.listening ? 'Stop recording' : 'Start speaking your answer'}
        >
          <Icon name={d.listening ? 'stop' : 'mic'} size={d.listening ? 22 : 26} />
        </button>
        <div className="vpanel__info">
          <b>{d.listening ? 'Listening… speak your answer' : text ? 'Answer captured' : 'Tap the mic and answer out loud'}</b>
          <span>
            {fmt(d.seconds)} · {words} words
            {d.seconds > 5 && words > 0 && ` · ${Math.round((words / d.seconds) * 60)} wpm`}
          </span>
        </div>
      </div>

      {(text || saved) && (
        <div className="vpanel__text">
          {text ? (
            <p>
              {d.finalText} <span className="interim">{d.interim}</span>
            </p>
          ) : (
            <>
              <small>Your last saved answer</small>
              <p>{saved.text}</p>
            </>
          )}
        </div>
      )}

      {d.error && <p className="notice">{d.error}</p>}
      {d.audioUrl && !d.listening && <audio className="vpanel__audio" controls src={d.audioUrl} />}

      <div className="vpanel__bar">
        <label className="check">
          <input type="checkbox" checked={record} onChange={(e) => setRecord(e.target.checked)} disabled={d.listening} />
          <span>Also save audio to listen back</span>
        </label>
        <div className="vpanel__btns">
          {text && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigator.clipboard?.writeText(text)}
              title="Copy your answer"
            >
              <Icon name="copy" size={16} /> Copy
            </button>
          )}
          {(text || saved) && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                d.stop()
                d.reset()
                progress.saveAnswer(q.id, '')
              }}
            >
              <Icon name="trash" size={16} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
