# How to Use Website Journey Tester V1.4.1

This guide explains how to run and use **Website Journey Tester V1.4.1 — Synthetic Cohorts + Safe AI Edits** on Windows.

The tool is designed for local static HTML websites and uses local Ollama models.

## Requirements

Install:

- Node.js
- Ollama
- Llama 3.2 3B — recommended/default
- Optional: Qwen 3 1.7B — experimental comparison model

Check Node.js:

```powershell
node --version
```

Install the recommended model:

```powershell
ollama pull llama3.2:3b
```

Optional experimental model:

```powershell
ollama pull qwen3:1.7b
```

Check installed models:

```powershell
ollama list
```

## Get the project

Repository:

`https://github.com/R1I2J3/Website-Journey-Tester-Synthetic-Cohorts`

Clone with Git:

```powershell
git clone https://github.com/R1I2J3/Website-Journey-Tester-Synthetic-Cohorts.git
```

The application is inside:

```text
Website-Journey-Tester-V1.4.1/
```

## Start the application

1. Make sure Ollama is running.
2. Open `Website-Journey-Tester-V1.4.1`.
3. Double-click `start.bat`.
4. If the browser does not open automatically, go to:

`http://127.0.0.1:8787`

or:

`http://localhost:8787`

The server is intended for local use and binds to `127.0.0.1`.

## Scan the website

The website being tested is stored in:

```text
Website-Journey-Tester-V1.4.1/
└── website/
```

The repository includes the fictional **Dinosaur Pangaea** website as a demonstration site.

In the application, click **Scan Website Folder**.

The scanner reads static information such as:

- page titles and headings;
- readable page text;
- links and buttons;
- form fields and labels;
- submit controls;
- images and missing-alt signals;
- broken local links;
- visible contact/help routes.

Pages are ranked dynamically against the task entered by the user.

## Test another static website

Before replacing the demo site, back up anything you want to keep.

Replace the contents of:

```text
Website-Journey-Tester-V1.4.1/website/
```

with the local static HTML/CSS/assets for the website you want to test.

Then click **Scan Website Folder** again.

Current scope: local static HTML source. The tool does not currently execute JavaScript-heavy SPAs, dynamically loaded content, real browser clicks, live form submission, or backend services.

## Single Digital Twin

Use **Single Digital Twin** to test one defined persona against one task.

1. Select **Single Digital Twin**.
2. Choose a model. Llama 3.2 3B is recommended.
3. Enter a persona.
4. Enter the task.
5. Run the assessment.
6. Review the outcome, summary, friction and recommendations.

Example persona:

> A first-time visitor with medium digital confidence who prefers clear instructions and obvious next steps.

Example task:

> Find the walking program and identify how to start applying to become a dinosaur walker.

## Synthetic Cohort

Use **Synthetic Cohort** to explore how several synthetic users with different functional characteristics may respond to the same task.

1. Select **Synthetic Cohort**.
2. Select a broad cohort.
3. Select the model.
4. Choose the number of simulations.
5. Choose a random seed.
6. Leave traits as Random, or set them manually.
7. Enter one clear user task.
8. Run the cohort.

Functional traits include:

- digital confidence;
- online-form confidence;
- organisation familiarity;
- time pressure;
- need for reassurance;
- tendency to seek human support;
- limited accessibility requirements.

Age defines the broad cohort only. The tool does not assume that age automatically determines digital ability.

## How the cohort result is produced

```text
Static website scan
        ↓
Task-evidence baseline
        ↓
Synthetic profile generation
        ↓
Local AI estimates profile impact
        ↓
Transparent application rules classify outcome
        ↓
JavaScript calculates cohort percentages
```

The final Complete, Needs Support and Abandon percentages are calculated from the individual synthetic assessments. The language model is not asked to invent an overall percentage.

For facts the scanner can verify directly — such as fields, labels, submit controls and visible contact routes — scanner evidence is treated as authoritative.

## Understanding the cohort report

The report includes:

- **Task evidence baseline** — whether the website appears to satisfy, partially satisfy or block the task.
- **Predicted synthetic outcomes** — Complete, Needs Support and Abandon counts/percentages.
- **Recurring friction** — task-relevant issues appearing across profiles.
- **Priority improvements** — recommendations grounded against scanned evidence.
- **Individual synthetic assessments** — profile traits, impact, final outcome, explanation and classification rule.

The tool may return fewer than three recommendations when fewer than three supported improvements are identified.

## Safe AI-modified copy

The original website is not edited.

```text
website/                 ← original, unchanged
    ↓
Create AI-Modified Copy
    ↓
website-modified/
    └── timestamped folder
        └── edited copy
```

To use it:

1. Review the recommendations.
2. Select only the improvements you want to try.
3. Click **Create AI-Modified Copy** or the cohort equivalent.
4. Wait for the local model to generate a constrained edit plan.
5. Review the result.
6. Open the modified copy.

A successful low-risk edit may show:

**Applied as a validated HTML edit.**

If a change cannot be safely applied, the application may fall back to an owner-review note.

Examples that may be auto-applied:

- relabelling an existing button;
- emphasizing existing text;
- making a known next step clearer.

Examples that should require owner input/review:

- inventing a real phone number;
- inventing a booking URL;
- adding unknown prices or policies;
- backend services;
- authentication;
- payments;
- database integration.

Always review the generated copy before using any change elsewhere.

## Where outputs are stored

Reports:

```text
Website-Journey-Tester-V1.4.1/reports/
```

Generated website copies:

```text
Website-Journey-Tester-V1.4.1/website-modified/
```

Generated outputs are ignored by Git in the supplied repository configuration.

## Recommended model

For this prototype, **Llama 3.2 3B** is the recommended/default model.

Qwen 3 1.7B was tested as a lighter comparison model, but it produced weaker evidence grounding in testing, including a fabricated phone number that did not exist on the demo website.

Therefore:

- use Llama for demonstrations and evidence-sensitive testing;
- treat Qwen as experimental;
- safe AI edit planning uses Llama.

This is a prototype-specific decision based on the local models tested, not a claim that Llama 3.2 3B is the best model for every use case.

## Troubleshooting

### Ollama/model error

```powershell
ollama list
```

If needed:

```powershell
ollama pull llama3.2:3b
```

Check loaded models:

```powershell
ollama ps
```

Stop a loaded model if required:

```powershell
ollama stop llama3.2:3b
```

### Node.js error

```powershell
node --version
```

### Port 8787 already in use

Close the previous Website Journey Tester server, or use:

```text
close-port.bat
```

Then restart `start.bat`.

### Browser shows an older interface

Hard refresh:

```text
Ctrl + Shift + R
```

Then scan the website again.

## Responsible interpretation

This is an **AI-assisted early usability-testing prototype**.

Synthetic profiles are not real research participants.

A result such as “60% predicted abandon” means 60% of the synthetic profiles in that run were classified as Abandon. It does not mean 60% of a real population would behave that way.

Use the tool to identify possible friction, usability hypotheses, areas worth investigating and potential improvements.

Important findings should still be validated against the website, organisation representatives and real users where appropriate.

AI-generated changes must be reviewed by a person before adoption.

## Future development opportunities

Possible extensions include:

- Playwright/browser automation for real navigation;
- actual link clicking and form attempts;
- accessibility tooling;
- screenshot/rendered-page analysis;
- original-versus-modified testing with the same cohort;
- stronger model evaluation;
- human usability validation alongside synthetic results.

## Credits

Original **Website Journey Tester V1.1**: Shane Currie.

V1.4.1 extends that foundation with Synthetic Cohorts, grounding safeguards, transparent cohort outcome classification and safe AI-assisted preview editing for Hack for Humanity 2026.
