import { useState } from 'react'
import { useApp } from '../context.jsx'
import Icon from './Icons.jsx'

const SPEEDS = [
  { label: '0.8×', value: 0.8 },
  { label: '1×', value: 1 },
  { label: '1.2×', value: 1.2 },
]

/** Play-all button, speed and voice picker. `items` = [{id, text}] */
export default function AudioBar({ items, sticky = true }) {
  const { speech } = useApp()
  const [showVoices, setShowVoices] = useState(false)
  const playingAll = speech.mode === 'all'

  return (
    <section className={`audiobar ${sticky ? '' : 'audiobar--static'}`} aria-label="Audio controls">
      {speech.supported ? (
        <>
          <div className="audiobar__row">
            {playingAll ? (
              <button className="btn btn--danger" onClick={speech.stop}>
                <Icon name="stop" size={18} /> Stop
              </button>
            ) : (
              <button className="btn btn--primary" onClick={() => speech.playAll(items)} disabled={!items.length}>
                <Icon name="speaker" size={18} /> Play all ({items.length})
              </button>
            )}
            <div className="seg" role="group" aria-label="Speech speed">
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  className={`seg__btn ${speech.rate === s.value ? 'is-on' : ''}`}
                  onClick={() => speech.setRate(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              className={`btn btn--ghost btn--icon ${showVoices ? 'is-on' : ''}`}
              onClick={() => setShowVoices((v) => !v)}
              aria-label="Voice settings"
              aria-expanded={showVoices}
              title="Choose voice"
            >
              <Icon name="sliders" size={20} />
            </button>
          </div>
          {showVoices && (
            <label className="voice-select">
              <span>Voice</span>
              <select value={speech.voiceURI} onChange={(e) => speech.chooseVoice(e.target.value)}>
                {speech.voices.length === 0 && <option value="">Default voice</option>}
                {speech.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      ) : (
        <p className="notice">Audio is not supported in this browser. Please try Chrome, Edge or Safari.</p>
      )}
    </section>
  )
}
