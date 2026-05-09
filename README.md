# Scholar — LLM-Powered Study Assistant by Loai Albalawi

> Selected Topics · Computer Science & Information Systems Department
> Almaarefa University

A small end-to-end web application that uses a Large Language Model (Claude
Sonnet 4 via the Anthropic API) to transform any topic, paragraph, or set of
lecture notes into structured study materials in four different formats.

---

## 1. Problem & Use Case

Students often have raw lecture notes or textbook passages but lack the time
to convert them into useful revision materials. **Scholar** solves this by
letting a student paste any text or topic and instantly receive:

- A structured **Summary** with main points and a key takeaway
- Six **Flashcards** (question / answer pairs)
- A five-question **Multiple-Choice Quiz** with explanations
- Six **Key Concepts** with definitions and concrete examples

This is a clear, real-world LLM use case: structured information generation
and reformatting from unstructured input.

---

## 2. How It Works
┌───────────┐     prompt      ┌──────────────────┐     JSON       ┌──────────────┐
│  Student  │ ──────────────► │  Anthropic API   │ ─────────────► │  Custom UI   │
│  (input)  │                 │  Claude Sonnet 4 │                │  renderer    │
└───────────┘                 └──────────────────┘                └──────────────┘
1. User selects a mode (Summary / Flashcards / Quiz / Concepts) and enters text.
2. The app sends a **mode-specific prompt** that asks the model to return
   strict JSON matching a fixed schema.
3. The response is parsed and rendered with a **custom UI per mode** —
   flashcards flip, quiz options give feedback, concepts use a two-column
   editorial layout.

### Prompt engineering

Each mode has its own prompt template that:
- Specifies the exact JSON shape expected
- Tells the model to return **only JSON** (no markdown, no commentary)
- The client strips any accidental code fences before `JSON.parse`

This is what allows the same LLM to power four completely different UIs.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| LLM | Claude Sonnet 4 (`claude-sonnet-4-20250514`) via Anthropic API |
| Frontend (demo) | Single-file HTML + vanilla JavaScript |
| Frontend (component) | React (`study-assistant.jsx`) |
| Styling | Custom CSS, Fraunces + Instrument Sans + JetBrains Mono fonts |

---

## 4. Files

| File | Purpose |
|---|---|
| `scholar.html` | Standalone single-file demo. Opens in any browser. |
| `study-assistant.jsx` | Same app written as a React component. |
| `README.md` | This file. |
| `LICENSE` | MIT License. |

---

## 5. How to Run

### Quick demo 

1. Download `scholar.html`.
2. Double-click to open in any modern browser.
3. Paste your Anthropic API key (get one at https://console.anthropic.com/).
4. Type a topic or paste text, choose a mode, click **Generate**.

### React version

The `study-assistant.jsx` file is a self-contained React component. Drop it
into any Vite/CRA React project and import it.

---

## 6. Responsible AI Practices

- **No hardcoded API keys** — the demo asks each user to provide their own
  key, which is held only in browser memory for the current tab and is
  never logged or persisted.
- **Errors are surfaced, not hidden** — failed API calls and parse errors
  show a clear message to the user.
- **Accuracy disclaimer** — the footer reminds users that LLM outputs may
  contain errors and important facts should be verified against
  authoritative sources.
- **No user data is stored** — input and output exist only in the browser
  tab and are gone on refresh.

### Known limitations

The demo calls the Anthropic API directly from the browser using the
`anthropic-dangerous-direct-browser-access` header. This is acceptable for
a classroom demo but in a production deployment the API call should be
proxied through a backend server so that users never need to handle API
keys themselves.

---

## 7. Evaluation Mapping

| Rubric Component | How Scholar covers it |
|---|---|
| Idea & Problem Definition (10%) | Real, common student need; clear LLM use case |
| UI/UX Design (20%) | Editorial typography, custom layouts per mode |
| LLM Integration (20%) | Anthropic API, mode-specific prompt engineering |
| Output Formatting (20%) | Strict JSON outputs → 4 distinct rich renderings |
| Teamwork & Presentation (15%) | (filled at presentation) |
| Documentation & Testing (15%) | This README + reproducible single-file demo |

---

## 8. Credits

Developed by **Loai Albalawi** for the
*Selected Topics* course, Almaarefa University.

- LLM: Claude (Anthropic)
- Fonts: Fraunces, Instrument Sans, JetBrains Mono (Google Fonts, OFL)
- License: MIT (see `LICENSE`)
