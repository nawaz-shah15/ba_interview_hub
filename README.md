# BA Interview Hub

A responsive React (Vite) app with **company-wise Business Analyst interview questions**,
grouped into **Banking & BFSI**, **Healthcare & Life Sciences** and **Others**.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

```bash
npm run build      # production build in /dist
npm run preview    # test the production build
```

> **Microphone note:** voice answers and the mock-interview microphone only work on `https://` or
> `http://localhost`. If you open the app on your phone through the Wi-Fi address (`http://192.168…`) the
> browser blocks the microphone – deploy it (Vercel / Netlify, both free) or test voice on your computer.

## Features

| Feature | Where |
|---|---|
| Industry → company → questions, **Next / Previous company** | Home |
| **Listen** to any question, **Play all**, speed and voice choice | Every question |
| **Star** hard questions, **mark as prepared**, progress bar per company | Every question / company page |
| **Answer out loud** – your speech is transcribed (optional audio playback) | “Answer” button |
| **Search across all companies** (e.g. “RTM”, “SQL joins”) | Search page / home |
| **Topic tags** & filter chips (Agile, SQL, Documentation, API, Domain, Behavioural…) | Company page, Search, “Browse by topic” |
| **Most asked topics** – ranked by number of companies that asked them | Most asked |
| **Mock interview** – random questions, read aloud, countdown timer, auto-next, summary | Mock interview |
| **My practice** – starred questions, saved voice answers, progress by company | My practice |
| **Light / dark mode** (remembers your choice, first visit follows your device) | Sun / moon button |

Everything you save (stars, prepared, answers, theme, voice, speed) stays **in your browser only**.

## Data

All questions are in `src/data/questions.json`:

```json
{
  "companies": [
    {
      "id": "digit-insurance",
      "name": "Digit Insurance",
      "industry": "bfsi",
      "rounds": [{ "name": "Round 1 – Pune", "questions": ["Tell me about your latest project."] }]
    }
  ]
}
```

* Add a company by adding an object to `companies` (`industry`: `bfsi`, `healthcare` or `others`).
* To move a company to another industry without editing it, use `src/data/industryOverrides.json`.
* Topic tags and the “Most asked” ranking are worked out automatically from the wording of each question
  (rules in `src/utils/topics.js` – add a keyword rule to teach it a new topic).
* `REVIEW_NOTES.md` lists every spelling fix that was made and the industry placements worth double-checking.

## Audio

Uses the browser's built-in speech (no API key). The question on screen is never changed – a separate spoken
version is built for the voice (`src/utils/speechText.js`): acronyms are spelled out (BRD → “B R D”) and long
questions are read sentence by sentence. Chrome and Edge give the most natural voices.
Speech-to-text for voice answers works in Chrome, Edge and Safari (not Firefox).

## Project structure

```
src/
  App.jsx                    routes (hash based) + theme + shared state
  context.jsx                shared app context
  data/                      questions.json, industryOverrides.json
  components/                Home, IndustryPage, CompanyPage, QuestionCard, VoicePanel,
                             SearchPage, TopAsked, MockPage, MyPractice, Header, AudioBar …
  utils/
    catalog.js               builds the question index (ids, tags, ranking)
    topics.js                tags + repeated-topic rules
    search.js                cross-company search
    progress.js              bookmarks / prepared / saved answers
    useSpeech.js, speechText.js   text-to-speech
    useDictation.js          speech-to-text (voice answers)
    useTheme.js              light / dark mode
  styles.css
```
