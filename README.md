# BA Interview Hub

A responsive React (Vite) app that shows **company-wise Business Analyst interview questions**,
grouped into three industries:

1. **Banking & BFSI**
2. **Healthcare & Life Sciences**
3. **Others**

Pick an industry → pick a company → read the questions, tap **▶** to hear any question
(or **Play all**), and use **Next company** / **Previous** to move through the companies.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).
`npm run dev` also exposes the app on your Wi‑Fi, so you can open the printed *Network* URL on your phone.

Production build:

```bash
npm run build
npm run preview
```

## Where are the questions?

All questions live in one JSON file: `src/data/questions.json`

```json
{
  "industries": [{ "id": "bfsi", "title": "Banking & BFSI", "tagline": "...", "icon": "bank" }],
  "companies": [
    {
      "id": "digit-insurance",
      "name": "Digit Insurance",
      "industry": "bfsi",
      "rounds": [{ "name": "Round 1 – Pune", "questions": ["Tell me about your latest project ..."] }]
    }
  ]
}
```

To add a company, add an object to `companies` and set `industry` to `bfsi`, `healthcare` or `others`.
The app picks it up automatically.

## Audio

Audio uses the browser's built‑in Web Speech API (no API key needed).

* The question on screen is never altered – a separate "spoken version" is built just for the voice
  (`src/utils/speechText.js`): acronyms are spelled out (BRD → "B R D"), shorthand such as *u* → "you",
  *vs* → "versus", and long questions are read sentence by sentence for clear delivery.
* Speed (0.8× / 1× / 1.2×) and voice can be changed from the audio bar.
* For the best voice use Chrome or Edge (they include natural English voices) or Safari on iPhone/Mac.

## Project structure

```
src/
  App.jsx                 routing (hash based) + data wiring
  data/questions.json     all companies & questions
  components/             Home, IndustryPage, CompanyPage, Header, Icons
  utils/useSpeech.js      text‑to‑speech hook
  utils/speechText.js     builds the spoken version of a question
  styles.css              all styling (responsive + dark mode)
```
