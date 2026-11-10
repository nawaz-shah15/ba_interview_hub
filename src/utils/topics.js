/**
 * Topic tags and "concepts" (the repeated questions) are detected from the
 * wording of each question, so new questions you add are tagged automatically.
 */

// ---- Broad categories (filter chips) ----
export const TAGS = [
  { id: 'agile', label: 'Agile & Scrum' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'stories', label: 'User Stories' },
  { id: 'sql', label: 'SQL & Data' },
  { id: 'api', label: 'API & Tech' },
  { id: 'testing', label: 'Testing & UAT' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'change', label: 'Change & Scope' },
  { id: 'process', label: 'Process & Design' },
  { id: 'tools', label: 'Tools & AI' },
  { id: 'bfsi', label: 'Domain: BFSI' },
  { id: 'health', label: 'Domain: Healthcare' },
  { id: 'behavioural', label: 'Behavioural & HR' },
  { id: 'scenario', label: 'Scenario-based' },
]
export const TAG_LABEL = Object.fromEntries(TAGS.map((t) => [t.id, t.label]))

// ---- Concepts: the specific topics that repeat across companies ----
// [label, category tag, regex]
const C = [
  ['Introduce yourself / walk through your CV', 'behavioural', /tell me about (your ?self|urself)|\bintro(duce|duction)?\b|self[- ]introduction|(walk|take) me through (your |my )?(resume|cv)|profile overview|about yourself|introduce yourself/i],
  ['Walk through your project', 'requirements', /(explain|walk|tell|describe|talk|about|details?).{0,40}\b(project|projects)\b|\bprojects? (you|i) (have )?worked|project overview|current project/i],
  ['Day-to-day role & responsibilities of a BA', 'requirements', /day[- ]to[- ]day|\bdaily\b.{0,25}(task|activit|responsib|job)|roles? and responsibilit|what (do|does) (you|i) do as (a )?ba|typical (work )?day|roles of (a )?ba|skills (ba|a ba)/i],
  ['BRD, FRD, FSD & SRS documents', 'documentation', /\b(brd|frd|fsd|srs|urs|urd)\b|business documents?|functional document/i],
  ['Elicitation & requirement gathering', 'requirements', /elicit|gather(ing)? .{0,20}requirement|requirement gathering|how .{0,20}(get|capture|collect|pick[- ]?up) .{0,25}requirement|from where you get the requirement|requirements? (from|through)/i],
  ['Prioritisation & MoSCoW', 'requirements', /priorit|moscow|moscww|t-shirt|priority assessment/i],
  ['User stories & INVEST', 'stories', /user stor|story format|\binvest\b|write a user story|user requirement/i],
  ['Acceptance criteria & Gherkin', 'stories', /acceptance criteria|\bac\b|gherkin|given[- ]when[- ]then/i],
  ['Definition of Done & Definition of Ready', 'agile', /\b(dod|dor)\b|definition of (done|ready)/i],
  ['Agile ceremonies & sprint activities', 'agile', /ceremon|sprint (planning|review|retro|demo|refinement|cycle|size|backlog|call)|retrospective|grooming|backlog refinement|refinement|stand-?up|plan (a |the )?sprint|in sprint planning|scrum (master|role)/i],
  ['Agile vs Waterfall & methodology', 'agile', /waterfall|methodolog|agile model|scrum or kanban|kanban|\bsdlc\b|agile or/i],
  ['Product & sprint backlog, epics, MVP', 'agile', /backlog|\bepic\b|\bmvp\b|road ?map/i],
  ['Story points & estimation', 'agile', /story point|fibonacci|estimat|velocity|burn-?down|pointing/i],
  ['Scope creep', 'change', /scope (creep|swap)/i],
  ['Change requests & change control', 'change', /change request|\bcrs?\b|\brfc\b|\bcab\b|change control|change management|changes? (in|to) (the )?requirement|requirement change|new requirement.{0,40}(sprint|middle|production|end)|(middle|end) of (the |a )?sprint/i],
  ['Gap analysis & impact analysis', 'requirements', /gap analysis|impact analysis/i],
  ['Requirement traceability matrix (RTM)', 'documentation', /\b(rtm|trm)\b|traceab/i],
  ['UAT & user acceptance', 'testing', /\buat\b|user acceptance/i],
  ['Test cases & testing', 'testing', /test case|testing|test scenario|\bsit\b|negative scenario/i],
  ['Bugs, defects & production issues', 'testing', /\bbugs?\b|defect|incident|production (issue|scenario|error|support)|root cause|show-?stopper|failed|failure/i],
  ['Handling conflicting stakeholders', 'stakeholders', /(conflict|differ|disagree|contradict|opposing|different requirements).{0,50}(stakeholder|requirement|opinion|group)|(stakeholder|requirement).{0,50}(conflict|disagree|contradict)|two (key )?stakeholders|difficult stakeholder|multiple (requirement|stakeholder)|(2|two|three) requirements?/i],
  ['Identifying & working with stakeholders', 'stakeholders', /who (are|is) (your|the) (key )?stakeholder|identify stakeholders|key stakeholders|stakeholder.{0,30}(not|no).{0,20}(give|answer|time|clarity|available)|work with (your )?stakeholder|interact with .{0,10}stakeholder|stakeholders? (is|are) (too )?busy/i],
  ['Technical feasibility & developer pushback', 'stakeholders', /feasib|developer.{0,40}(doubt|clarif|not understand|wrong|late|says)|dev (says|have|keep)|explain .{0,20}requirement.{0,20}develop|convey .{0,20}requirement|work with developers/i],
  ['Vague, one-line or missing requirements', 'requirements', /one[- ]?line|1 liner|one sentence|high[- ]level requirement|vague|ambigu|not (aware|clear)|no data available|stakeholder is not aware/i],
  ['Is the requirement complete & good?', 'requirements', /(requirement|stories|story).{0,45}(good|complete|clear|proper|correct|validate|sign[- ]?off)|(make sure|verify|validate|know|say).{0,35}requirement.{0,20}(good|clear|complete|correct)|sign off/i],
  ['Functional vs non-functional requirements', 'requirements', /non[- ]?func|\bnfrs?\b|functional (and|&|vs)|functional requirement/i],
  ['BA vs Product Owner / PM / Scrum Master', 'agile', /product owner|project manager|product manager|\bpo\b.{0,15}\bba\b|\bba\b.{0,25}(po|pm|scrum master)/i],
  ['SQL, joins & queries', 'sql', /\bsql\b|\bjoins?\b|union|truncate|group by|primary key|foreign key|subquer|quer(y|ies)|\bdelete\b.{0,15}\bdrop\b|vlookup|xlookup|excel/i],
  ['API & integrations', 'api', /\bapis?\b|\brest\b|\bsoap\b|postman|payload|endpoint|integrat|https?\b/i],
  ['Data mapping, migration & data quality', 'sql', /data mapping|source[- ]to[- ]target|\bstm\b|migration|lineage|\betl\b|\belt\b|\boltp\b|\bolap\b|data quality|data validation|replication/i],
  ['Process modelling, BPMN, UML & flows', 'process', /use ?case|\buml\b|sequence diagram|activity diagram|flow ?chart|process (flow|map|model)|bpmn|bizagi|blueworks|draw\.io|visio|user journey|diagram/i],
  ['Wireframes, prototypes & UX', 'process', /wireframe|mock-?up|prototyp|balsamiq|figma|\bui\b|\bux\b|user experience/i],
  ['Jira, Confluence & BA tools', 'tools', /\bjira\b|confluence|azure|devops|which tools?|what tools?|tools? (do|did|have|you|that|used|u)|tools? (and|&) tech/i],
  ['AI & Gen AI at work', 'tools', /\bai\b|gen ?ai|generative|chat ?gpt|copilot|agentic|\brag\b|\bgpt\b|claude/i],
  ['KPIs & measuring success', 'requirements', /\bkpis?\b|success metric|measure.{0,25}success|agile metrics|metrics/i],
  ['Risk, security & compliance (GDPR, HIPAA)', 'requirements', /\brisks?\b|gdpr|hipaa|\bpii\b|security|complian|regulat|penetration/i],
  ['Workshops & brainstorming', 'requirements', /workshop|brainstorm|focus group/i],
  ['Challenging or complex requirement you handled', 'behavioural', /challeng|complex|tough|biggest|lesson|achievement|difficult (situation|requirement)/i],
  ['Why change job, notice period & salary', 'behavioural', /why (are|do|am) (you|i).{0,25}(leav|chang|switch|look)|looking for (a )?(job )?change|notice period|salary|package|relocat|aspiration|where do you see|why should we hire|why do you want to (join|work)|what do you know about (our|the) company|family|strength|weakness|work during|flexible with|working hours|when can you join/i],
  ['Do you have any questions for us?', 'behavioural', /any questions|any queries|do you have any question|questions for (me|us|you)/i],
  ['Team handling & leadership', 'behavioural', /team size|(manage|handle|lead|led).{0,25}(team|junior|resource)|\bjunior\b|lead any team/i],
  ['KYC & AML', 'bfsi', /\bkyc\b|\baml\b|money launder|\bsar\b|acams/i],
  ['Payments & cards', 'bfsi', /payment|\bupi\b|\bcard\b|debit|credit(ed)?\b|refund|reconcil|authoriz|settlement|gateway|\batm\b/i],
  ['Loans, lending & mortgages', 'bfsi', /\bloan|mortgage|\blos\b|\blms\b|lending|\bltv\b|\bemi\b|cibil|fico/i],
  ['Insurance: policy, claims & underwriting', 'bfsi', /insurance|\bclaims?\b|\bpolicy\b|policies|underwrit|subrogation|endorsement|premium|\bp ?& ?c\b|peril|reinstat|indemnity|renewal/i],
  ['Capital markets & trading', 'bfsi', /capital market|derivative|equity|\boption|\bswap\b|forward contract|future contract|margin|trade life|custody|depository|corporate action|securities|\botc\b|short position|long position/i],
  ['Banking domain scenarios', 'bfsi', /\bbank|banking|beneficiary|account/i],
  ['LIMS, GxP & pharma', 'health', /\blims\b|gxp|21 cfr|gamp|\beln|\bqms\b|\bcsv\b|\bsdms\b|\bcapa\b|pharma|\blab\b|laborator|sample|\biq\b|\boq\b|\bpq\b|donor|microbiology/i],
  ['HL7, FHIR, EMR & healthcare data', 'health', /hl7|fhir|\bemr\b|\behr\b|hospital|patient|billing|healthcare|health care|prescription|doctor/i],
]
export const CONCEPTS = C.map(([label, tag, re], i) => ({ id: `c${i}`, label, tag, re }))

const SCENARIO_RE = /scenario|suppose|imagine|let'?s say|consider|what would you do|what will you do|case:|how (would|will|do) you (handle|manage|deal|approach|investigate|resolve)|if (the|a|there|client|stakeholder|you|we|dev|developer|business|someone)/i

/** Returns { tags:[...], concepts:[...] } for a question text. */
export function classify(text) {
  const concepts = []
  const tags = new Set()
  CONCEPTS.forEach((c) => {
    if (c.re.test(text)) {
      concepts.push(c.id)
      tags.add(c.tag)
    }
  })
  if (SCENARIO_RE.test(text)) tags.add('scenario')
  if (tags.size === 0) tags.add('requirements')
  return { tags: [...tags], concepts }
}
