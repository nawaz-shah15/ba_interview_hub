import { useCallback, useEffect, useRef, useState } from 'react'

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

const ERRORS = {
  'not-allowed': 'Microphone access is blocked. Allow the microphone in your browser and try again.',
  'service-not-allowed': 'Microphone access is blocked. Allow the microphone in your browser and try again.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
}

/**
 * Speech-to-text for practising answers. Optionally records the audio too, so
 * people can listen back to themselves.
 * NOTE: the browser only allows the microphone on https:// or http://localhost.
 */
export function useDictation({ lang = 'en-IN', record = false } = {}) {
  const supported = !!SR
  const recRef = useRef(null)
  const wantRef = useRef(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const [listening, setListening] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')

  const stopRecording = useCallback(() => {
    try {
      mediaRef.current?.recorder?.state === 'recording' && mediaRef.current.recorder.stop()
      mediaRef.current?.stream?.getTracks().forEach((t) => t.stop())
    } catch {
      /* ignore */
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!record || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(blob)
        })
      }
      recorder.start()
      mediaRef.current = { recorder, stream }
    } catch {
      /* recording is optional – transcription still works */
    }
  }, [record])

  const stop = useCallback(() => {
    wantRef.current = false
    clearInterval(timerRef.current)
    try {
      recRef.current?.stop()
    } catch {
      /* ignore */
    }
    stopRecording()
    setListening(false)
    setInterim('')
  }, [stopRecording])

  const start = useCallback(() => {
    if (!SR || wantRef.current) return
    setError('')
    const rec = new SR()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e) => {
      let fin = ''
      let tmp = ''
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) fin += t
        else tmp += t
      }
      if (fin) setFinalText((p) => `${p} ${fin}`.trim())
      setInterim(tmp)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      setError(ERRORS[e.error] || 'Speech recognition stopped unexpectedly.')
      if (ERRORS[e.error]) {
        wantRef.current = false
        setListening(false)
        clearInterval(timerRef.current)
        stopRecording()
      }
    }
    rec.onend = () => {
      // browsers end recognition after a pause – restart while the user still wants to speak
      if (wantRef.current) {
        try {
          rec.start()
        } catch {
          /* ignore */
        }
      } else {
        setListening(false)
        setInterim('')
      }
    }

    recRef.current = rec
    wantRef.current = true
    try {
      rec.start()
      setListening(true)
      setSeconds(0)
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      startRecording()
    } catch {
      wantRef.current = false
    }
  }, [lang, startRecording, stopRecording])

  const reset = useCallback(() => {
    setFinalText('')
    setInterim('')
    setSeconds(0)
    setError('')
    setAudioUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return ''
    })
  }, [])

  useEffect(
    () => () => {
      wantRef.current = false
      clearInterval(timerRef.current)
      try {
        recRef.current?.abort()
      } catch {
        /* ignore */
      }
      stopRecording()
    },
    [stopRecording],
  )

  return { supported, listening, finalText, interim, error, seconds, audioUrl, start, stop, reset, setFinalText }
}
