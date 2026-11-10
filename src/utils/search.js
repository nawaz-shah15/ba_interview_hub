import { questions } from './catalog.js'
import { TAG_LABEL } from './topics.js'

// Words people type that should also find related wording.
const ALIASES = {
  rtm: ['traceability', 'trm'],
  trm: ['rtm', 'traceability'],
  dod: ['definition of done'],
  dor: ['definition of ready'],
  ac: ['acceptance criteria'],
  cr: ['change request'],
  uat: ['user acceptance'],
  po: ['product owner'],
  nfr: ['non functional', 'non-functional'],
  stp: ['straight through', 'straight-through'],
  moscow: ['moscow'],
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s'’&/+.-]/g, ' ')

/** All words must match (a word may match through one of its aliases). */
export function searchQuestions(query, { tag = null, industry = null } = {}) {
  const terms = norm(query).split(/\s+/).filter(Boolean)
  return questions.filter((q) => {
    if (tag && !q.tags.includes(tag)) return false
    if (industry && q.industry !== industry) return false
    if (!terms.length) return true
    const hay = `${norm(q.text)} ${q.tags.map((t) => TAG_LABEL[t].toLowerCase()).join(' ')}`
    return terms.every((t) => hay.includes(t) || (ALIASES[t] || []).some((a) => hay.includes(a)))
  })
}
