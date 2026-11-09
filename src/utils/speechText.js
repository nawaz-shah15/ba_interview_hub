/**
 * Prepares a question for text-to-speech.
 *
 * The question shown on screen is NEVER changed – this only builds a
 * "spoken version" so that the voice reads acronyms and shorthand clearly
 * (for example "BRD" -> "B R D", "u" -> "you", "vs" -> "versus").
 */

// Acronyms that are safe to match in any letter-case
const SPELL_ANY_CASE = [
  'brd', 'frd', 'fsd', 'srs', 'urs', 'rtm', 'trm', 'uat', 'sql', 'api', 'apis', 'ui', 'ux', 'ba', 'dod',
  'dor', 'nfr', 'nfrs', 'kpi', 'kpis', 'aml', 'kyc', 'stp', 'los', 'lms', 'etl', 'elt', 'oltp', 'olap',
  'mvp', 'bpmn', 'sdlc', 'gdpr', 'hipaa', 'pii', 'rfc', 'eln', 'elnb', 'qms', 'sdd', 'scod', 'sftp',
  'atm', 'clm', 'mdm', 'stm', 'html', 'css', 'ltv', 'poc', 'pvt', 'cfr', 'sla', 'sme', 'smes', 'qa',
  'qe', 'qes', 'ai', 'csv', 'gxp',
]

// Acronyms that need an exact (upper-case) match, because the lower-case
// form is a normal English word (e.g. "sit", "cab", "it", "ap").
const SPELL_EXACT = [
  'SIT', 'PAS', 'CAB', 'CR', 'CRs', 'PO', 'POs', 'HR', 'IT', 'AP', 'COA', 'GST', 'SAR', 'IQ', 'OQ', 'PQ',
  'EMR', 'EHR', 'ACH', 'ECS', 'IDE', 'IDEs', 'URL', 'PDF', 'CRM', 'ERP', 'CEO', 'CTO', 'CFO', 'DBA',
  'OCR', 'L1', 'L2', 'L3', 'CI', 'CD', 'LES', 'SDMS', 'RAG', 'PR', 'CGI', 'TCS', 'EY', 'IBM', 'SQLs',
]

// Special pronunciations
const SPECIAL = [
  [/\bjson\b/gi, 'Jason'],
  [/\bfhir\b/gi, 'fire'],
  [/\bmoscow\b/gi, 'Moscow'],
  [/\bmoscww\b/gi, 'Moscow'],
  [/\bhl7\b/gi, 'H L 7'],
  [/\bgxp\b/gi, 'G x P'],
  [/\bP\s?&\s?C\b/g, 'P and C'],
  [/\bDoD\b/g, 'D O D'],
  [/\bDoR\b/g, 'D O R'],
  [/\bUI\s*\/\s*UX\b/gi, 'U I and U X'],
  [/\bPL\s*\/\s*SQL\b/gi, 'P L SQL'],
  [/\bQ\s*&\s*A\b/gi, 'Q and A'],
  [/\bWiFi\b/gi, 'Wi-Fi'],
  [/\bGPT-?4\.5\b/gi, 'G P T 4.5'],
  [/\bGPT\b/g, 'G P T'],
  [/\b21 CFR Part 11\b/gi, 'twenty one C F R part eleven'],
  [/\bGAMP\b/g, 'gamp'],
  [/\bLIMS\b/g, 'lims'],
  [/\bHTTPS\b/g, 'H T T P S'],
  [/\bHTTP\b/g, 'H T T P'],
  [/\bDB\b/g, 'D B'],
  [/\bDBat\b/g, 'D B at'],
]

// Chat-style shorthand (case-insensitive, whole word)
const SHORTHAND = {
  u: 'you',
  ur: 'your',
  bw: 'between',
  hv: 'have',
  abt: 'about',
  qs: 'questions',
  ques: 'question',
  ans: 'answer',
  req: 'requirement',
  reqs: 'requirements',
  yrs: 'years',
  yr: 'year',
  vs: 'versus',
  'vs.': 'versus',
  w: 'with',
  'w/': 'with',
  tech: 'technical',
  dev: 'developer',
  devs: 'developers',
  intro: 'introduction',
  esign: 'e-sign',
  nonfunc: 'non functional',
  func: 'functional',
  ok: 'okay',
}

const spellOut = (word) => word.replace(/[^A-Za-z0-9]/g, '').toUpperCase().split('').join(' ')

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const anyCaseRe = new RegExp(`\\b(${SPELL_ANY_CASE.map(escapeRe).join('|')})(s?)\\b`, 'gi')
const exactRe = new RegExp(`(?<![A-Za-z0-9])(${SPELL_EXACT.map(escapeRe).join('|')})(?![A-Za-z0-9])`, 'g')
const shorthandRe = new RegExp(
  `(?<![A-Za-z0-9])(${Object.keys(SHORTHAND).map(escapeRe).join('|')})(?![A-Za-z0-9])`,
  'gi',
)

// Emoji & pictographs are removed – voices would otherwise read their names.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu

export function prepareSpeech(text) {
  let t = text.replace(EMOJI_RE, ' ')

  SPECIAL.forEach(([re, rep]) => {
    t = t.replace(re, rep)
  })

  // chat shorthand first (so the "u" in "UAT" is never touched afterwards)
  t = t.replace(shorthandRe, (m) => {
    const key = m.toLowerCase()
    if ((key === 'u' || key === 'w') && m !== key) return m // keep capital U / W
    return SHORTHAND[key] || m
  })
  // exact-case acronyms, then safe acronyms in any case (with optional plural "s")
  t = t.replace(exactRe, (m) => spellOut(m))
  t = t.replace(anyCaseRe, (m, word, plural) => spellOut(word) + (plural ? "'s" : ''))

  t = t
    .replace(/\s*&\s*/g, ' and ')
    .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1 to $2')
    .replace(/\s*\/\s*/g, ' or ')
    .replace(/\s+[–—-]\s+/g, ', ')
    .replace(/:\s+/g, ', ')
    .replace(/;\s*/g, ', ')
    .replace(/\(\s*/g, ', ')
    .replace(/\s*\)/g, ',')
    .replace(/\*+/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*([?.!])/g, '$1')
    .trim()

  return t
}

/** Splits long text into short, sentence-sized chunks (avoids browser cut-offs). */
export function toChunks(text, max = 180) {
  const sentences = text.match(/[^.?!]+[.?!]+(?:\s|$)|[^.?!]+$/g) || [text]
  const chunks = []
  let cur = ''
  sentences.forEach((s) => {
    const part = s.trim()
    if (!part) return
    if ((cur + ' ' + part).trim().length > max && cur) {
      chunks.push(cur.trim())
      cur = part
    } else {
      cur = (cur + ' ' + part).trim()
    }
  })
  if (cur) chunks.push(cur.trim())

  // hard-split any chunk that is still too long (at commas / spaces)
  return chunks.flatMap((c) => {
    if (c.length <= max * 1.5) return [c]
    const out = []
    let buf = ''
    c.split(/(?<=,)\s+|\s+/).forEach((w) => {
      if ((buf + ' ' + w).length > max && buf) {
        out.push(buf.trim())
        buf = w
      } else buf = (buf + ' ' + w).trim()
    })
    if (buf) out.push(buf.trim())
    return out
  })
}
