import { useCallback, useEffect, useRef, useState } from 'react'
import { prepareSpeech, toChunks } from './speechText.js'

const LS_RATE = 'bahub.rate'
const LS_VOICE = 'bahub.voice'

const read = (k, fallback) => {
  try {
    const v = window.localStorage.getItem(k)
    return v === null ? fallback : v
  } catch {
    return fallback
  }
}
const write = (k, v) => {
  try {
    window.localStorage.setItem(k, String(v))
  } catch {
    /* ignore */
  }
}

/** Ranks voices so the clearest English voice is picked by default. */
function scoreVoice(v) {
  const lang = (v.lang || '').replace('_', '-').toLowerCase()
  if (!lang.startsWith('en')) return -1
  let s = 1
  if (lang === 'en-in') s += 6
  else if (lang === 'en-gb') s += 4
  else if (lang === 'en-us') s += 3
  if (/natural|neural|online/i.test(v.name)) s += 5
  if (/google/i.test(v.name)) s += 3
  if (/microsoft/i.test(v.name)) s += 2
  if (/samantha|karen|daniel|rishi|veena|aria|jenny|ravi|neerja|prabhat/i.test(v.name)) s += 2
  return s
}

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState(() => read(LS_VOICE, ''))
  const [rate, setRateState] = useState(() => Number(read(LS_RATE, '0.95')) || 0.95)
  const [activeId, setActiveId] = useState(null)
  const [mode, setMode] = useState('idle') // idle | single | all

  const runRef = useRef(0)
  const rateRef = useRef(rate)
  const voiceRef = useRef(null)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  // ---- load voices (they arrive asynchronously in most browsers) ----
  useEffect(() => {
    if (!supported) return undefined
    const load = () => {
      const list = window.speechSynthesis.getVoices().filter((v) => (v.lang || '').toLowerCase().startsWith('en'))
      list.sort((a, b) => scoreVoice(b) - scoreVoice(a))
      setVoices(list)
    }
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [supported])

  // ---- keep the chosen voice object in a ref ----
  useEffect(() => {
    if (!voices.length) return
    const chosen = voices.find((v) => v.voiceURI === voiceURI) || voices[0]
    voiceRef.current = chosen
    if (chosen && chosen.voiceURI !== voiceURI) setVoiceURI(chosen.voiceURI)
  }, [voices, voiceURI])

  const setRate = useCallback((r) => {
    setRateState(r)
    write(LS_RATE, r)
  }, [])

  const chooseVoice = useCallback((uri) => {
    setVoiceURI(uri)
    write(LS_VOICE, uri)
  }, [])

  // ---- speak one question (resolves when finished or cancelled) ----
  const speakText = useCallback(
    (text, run) =>
      new Promise((resolve) => {
        const chunks = toChunks(prepareSpeech(text))
        let i = 0
        const next = () => {
          if (runRef.current !== run || i >= chunks.length) {
            resolve()
            return
          }
          const u = new window.SpeechSynthesisUtterance(chunks[i++])
          const v = voiceRef.current
          if (v) {
            u.voice = v
            u.lang = v.lang
          } else {
            u.lang = 'en-IN'
          }
          u.rate = rateRef.current
          u.pitch = 1
          u.volume = 1
          u.onend = next
          u.onerror = () => resolve()
          window.speechSynthesis.speak(u)
        }
        next()
      }),
    [],
  )

  const stop = useCallback(() => {
    runRef.current += 1
    if (supported) window.speechSynthesis.cancel()
    setActiveId(null)
    setMode('idle')
  }, [supported])

  /** Play (or stop, when it is already playing) a single question. */
  const play = useCallback(
    async (id, text) => {
      if (!supported) return
      if (activeId === id && mode === 'single') {
        stop()
        return
      }
      runRef.current += 1
      window.speechSynthesis.cancel()
      const run = runRef.current
      setActiveId(id)
      setMode('single')
      await new Promise((r) => setTimeout(r, 80))
      if (runRef.current !== run) return
      await speakText(text, run)
      if (runRef.current === run) {
        setActiveId(null)
        setMode('idle')
      }
    },
    [supported, activeId, mode, speakText, stop],
  )

  /** Read a whole list of questions one after another. */
  const playAll = useCallback(
    async (items) => {
      if (!supported || !items.length) return
      runRef.current += 1
      window.speechSynthesis.cancel()
      const run = runRef.current
      setMode('all')
      await new Promise((r) => setTimeout(r, 80))
      for (const item of items) {
        if (runRef.current !== run) return
        setActiveId(item.id)
        await speakText(item.text, run)
        if (runRef.current !== run) return
        await new Promise((r) => setTimeout(r, 650))
      }
      if (runRef.current === run) {
        setActiveId(null)
        setMode('idle')
      }
    },
    [supported, speakText],
  )

  // stop everything when the tab is closed / hidden
  useEffect(() => {
    if (!supported) return undefined
    const onHide = () => window.speechSynthesis.cancel()
    window.addEventListener('beforeunload', onHide)
    return () => {
      window.removeEventListener('beforeunload', onHide)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  return { supported, voices, voiceURI, chooseVoice, rate, setRate, activeId, mode, play, playAll, stop }
}
