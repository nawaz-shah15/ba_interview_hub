import data from '../data/questions.json'
import overrides from '../data/industryOverrides.json'
import { classify, CONCEPTS } from './topics.js'

export const industries = data.industries

/** Companies (with any manual industry override applied). */
export const companies = data.companies.map((c) => ({ ...c, industry: overrides[c.id] || c.industry }))

export const companyById = Object.fromEntries(companies.map((c) => [c.id, c]))
export const industryById = Object.fromEntries(industries.map((i) => [i.id, i]))

/** "first" | "second" | "final" | "other" */
export function roundKind(name = '') {
  const n = name.toLowerCase()
  if (/\bl3\b|round\s*3|manager|final/.test(n)) return 'final'
  if (/\bl2\b|round\s*2|second/.test(n)) return 'second'
  if (/\bl1\b|round\s*1|first|1st/.test(n)) return 'first'
  return 'other'
}

/** Flat list of every question, with id, tags and concept links. */
export const questions = []
export const questionsByCompany = {}
export const questionById = {}

companies.forEach((c) => {
  questionsByCompany[c.id] = []
  c.rounds.forEach((r, ri) => {
    r.questions.forEach((text, qi) => {
      const { tags, concepts } = classify(text)
      const q = {
        id: `${c.id}__${ri}_${qi}`,
        text,
        n: qi + 1,
        companyId: c.id,
        companyName: c.name,
        industry: c.industry,
        roundIndex: ri,
        roundName: r.name,
        roundKind: roundKind(r.name),
        tags,
        concepts,
      }
      questions.push(q)
      questionsByCompany[c.id].push(q)
      questionById[q.id] = q
    })
  })
})

export const companyTotals = (id) => questionsByCompany[id]?.length || 0

/** Ranked list of repeated topics (by number of different companies that asked). */
export const topConcepts = CONCEPTS.map((c) => {
  const qs = questions.filter((q) => q.concepts.includes(c.id))
  const comps = new Set(qs.map((q) => q.companyId))
  return { ...c, questions: qs, companyCount: comps.size, questionCount: qs.length }
})
  .filter((c) => c.companyCount >= 2)
  .sort((a, b) => b.companyCount - a.companyCount || b.questionCount - a.questionCount)
  .slice(0, 50)
