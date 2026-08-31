# Website Journey Tester V1.4.1 — Synthetic Cohorts + Safe AI Edits

Hack for Humanity 2026 prototype built from **Website Journey Tester V1.1 by Shane Currie**.

V1.4.1 keeps the original single-persona test and adds a domain-neutral Synthetic Cohort mode for local static HTML websites. It also supports real, constrained HTML edits on a timestamped copy of the tested website.

## Core workflow

1. Scan a local static website from `Website-Journey-Tester-V1.4.1/website/`.
2. Choose **Single Digital Twin** or **Synthetic Cohort**.
3. Enter the user task.
4. Run the assessment through local Ollama.
5. Review friction, outcomes and recommendations.
6. Optionally create an AI-modified timestamped preview copy in `website-modified/`.
7. Human-review every generated change before using it elsewhere.

## Synthetic Cohort mode

- Prototype cohort presets: Younger adults (18–34), Middle-age adults (35–64), Older adults (65–85).
- Functional traits vary independently from age, including digital confidence, form confidence, organisation familiarity, time pressure, reassurance need, support-seeking tendency and a limited accessibility field.
- Reproducible random seed.
- 1–20 sequential profile simulations.
- One task-evidence baseline is created before persona-impact simulations.
- The local LLM estimates profile impact while transparent JavaScript rules classify `complete`, `needs_support` or `abandon`.
- JavaScript calculates the percentages from the individual simulation results; the LLM does not invent aggregate percentages.

## Domain-neutral scanner

The scanner does not use Dogs Canberra-, dinosaur-, rowing-, shop- or bank-specific topic keywords. It extracts generic HTML information such as titles, headings, main text, links, buttons, form fields, labels, images, missing-alt signals and broken local links, then dynamically ranks pages from the user's task.

## Models

- **Llama 3.2 3B — recommended/default.**
- **Qwen 3 1.7B — experimental assessment option.** Internal testing showed it can be faster, but it produced weaker evidence grounding in some tests, including a hallucinated phone number. Do not rely on it for evidence-sensitive conclusions.
- **Safe AI edits always use Llama 3.2 3B**, even if Qwen was used for the preceding assessment.

## Safe AI-modified copies

The original `website/` folder is never changed. Selected recommendations are applied only to a new timestamped copy under `website-modified/`.

The editor prefers small constrained operations such as relabelling an existing button or emphasizing existing text. It rejects or falls back to an owner-review note when a proposal would add executable JavaScript, invent an external URL, damage major document structure, remove existing asset references, require unknown real-world facts, or otherwise fail source-level validation.

This is **AI-assisted preview editing**, not autonomous production deployment. Technically valid changes can still be poor UX choices, and multiple recommendations can overlap, so every generated copy must be reviewed by a person.

## Requirements

- Node.js installed.
- Ollama running locally.
- Recommended model: `ollama pull llama3.2:3b`
- Optional experimental comparison model: `ollama pull qwen3:1.7b`

## Run

1. Put the static website to test inside `Website-Journey-Tester-V1.4.1/website/`.
2. Start Ollama.
3. On Windows, run `Website-Journey-Tester-V1.4.1/start.bat`.
4. Or from the `Website-Journey-Tester-V1.4.1` folder run `node app/server.js`.
5. Open `http://localhost:8787` if the browser does not open automatically.
6. Click **Scan Website Folder**.

The server is intended for local use and binds to `127.0.0.1`.

## Important limitations

- Synthetic percentages are AI-assisted predictions, not survey results or observed human behaviour.
- Static HTML source only; JavaScript-heavy SPAs and dynamically loaded content are not executed.
- No real browser clicking, form completion or autonomous journey navigation yet.
- No screenshot/rendered-CSS analysis, so visual layout and contrast claims are intentionally limited.
- Small local models can still hallucinate or reason incorrectly. Important findings must be checked against the actual website and, where appropriate, real user testing.
- The included age-band cohorts are prototype presets, not official Hack for Humanity personas and not a claim that age determines digital behaviour.

## Credits

Original Website Journey Tester V1.1: **Shane Currie**.

V1.4.1 synthetic-cohort and safe-edit iteration: Hack for Humanity 2026 team prototype based on Shane's V1.1.

The source repository includes a CC0 1.0 Universal dedication. Attribution is retained as good team practice.
