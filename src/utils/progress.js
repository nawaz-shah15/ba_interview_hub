import { useCallback, useEffect, useMemo, useState } from 'react'

const KEY = 'bahub.progress.v1'
const empty = { starred: {}, prepared: {}, answers: {} }

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty
    const p = JSON.parse(raw)
    return { starred: p.starred || {}, prepared: p.prepared || {}, answers: p.answers || {} }
  } catch {
    return empty
  }
}

/** Bookmarks, "prepared" marks and saved voice-answer transcripts (stored in the browser). */
export function useProgressStore() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full / blocked – ignore */
    }
  }, [state])

  const toggle = useCallback((bucket, id) => {
    setState((s) => {
      const next = { ...s[bucket] }
      if (next[id]) delete next[id]
      else next[id] = true
      return { ...s, [bucket]: next }
    })
  }, [])

  const toggleStar = useCallback((id) => toggle('starred', id), [toggle])
  const togglePrepared = useCallback((id) => toggle('prepared', id), [toggle])

  const saveAnswer = useCallback((id, text) => {
    setState((s) => {
      const answers = { ...s.answers }
      if (text && text.trim()) answers[id] = { text: text.trim(), at: Date.now() }
      else delete answers[id]
      return { ...s, answers }
    })
  }, [])

  const reset = useCallback(() => setState(empty), [])

  return useMemo(
    () => ({
      starred: state.starred,
      prepared: state.prepared,
      answers: state.answers,
      toggleStar,
      togglePrepared,
      saveAnswer,
      reset,
      isStarred: (id) => !!state.starred[id],
      isPrepared: (id) => !!state.prepared[id],
      countPrepared: (list) => list.reduce((a, q) => a + (state.prepared[q.id] ? 1 : 0), 0),
      countStarred: (list) => list.reduce((a, q) => a + (state.starred[q.id] ? 1 : 0), 0),
    }),
    [state, toggleStar, togglePrepared, saveAnswer, reset],
  )
}
