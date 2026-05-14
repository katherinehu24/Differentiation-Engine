# Differentiation Reasoning Engine

A local-first investor workbench for assessing whether a company stays differentiated as adjacent ecosystems converge.

Most research tools summarize what a company does today. This engine reasons about durability under ecosystem convergence — what each incumbent is *technically capable* of versus *strategically incentivized* to build, and whether the target's wedge survives the next two to three years of standards and bundling pressure.

The output is eleven structured sections leading with synthesized reasoning, with the underlying sources cited *below* the reasoning as supporting evidence. The engine prefers honest uncertainty to false confidence.

## Run locally

Self-contained `index.html`, no build step. Open directly in a browser, or serve via any static server:

```
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

Live web search runs through a Vercel serverless function at `api/search.mjs` (wraps Tavily Search). When that endpoint is unreachable — for example, opening `index.html` directly with `file://` — the discovery feed gracefully falls back to a baked-in set of real findings. The status badge reads "Live · complete" or "Cached real findings" so it is always explicit about which mode is running.

## Deploy to Vercel

Free tier. No credit card required.

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new>, choose **Import Git Repository**, select the repo.
3. Framework Preset: **Other**. Root Directory: `./`. Leave Build Command and Output Directory empty.
4. Under **Environment Variables**, add:
   - Name: `TAVILY_API_KEY`
   - Value: a Tavily key from <https://tavily.com> (free tier: 1,000 searches/month, no card at signup)
5. Click **Deploy**. URL prints after roughly 30 seconds.

The deploy serves the static `index.html` and routes `/api/search` to the serverless function. Live Tavily searches fire from any browser.

## Demo flow

1. Click **Load Keycard Demo**. Prefills company, website, and runs six discovery queries across the target's own surface and the adjacent ecosystem.
2. Click **Generate Analysis**. The engine produces eleven structured sections.
3. Click **Export Memo** to download a Markdown investor memo with every cited URL preserved.

## Output sections

```
00  Purpose of This Engine
01  Company Decomposition
02  Technical Architecture
03  Backend Workflow Inference
04  Ecosystem Positioning
05  Incumbent Expansion Map
06  Strategic vs Technical Possibility
07  Durability Assessment
08  Evidence Strength
09  Strategic Risks
10  Open Diligence Questions
11  What Would Change This Conclusion
    Appendix: Research Log
```

Each section separates inference from validated evidence. Confidence labels are explicit. Sources are cited below the reasoning, not above it.

## Project layout

```
.
├── index.html       Self-contained app: UI, engine, cached real-data fallback
├── api/
│   └── search.mjs   Vercel serverless function wrapping Tavily Search
└── vercel.json      Deploy config (minimal)
```

## Design principles

- **Synthesis over retrieval.** A list of links is not analysis.
- **Technical possibility is not strategic likelihood.** Capability is cheap; ecosystem incentives are not.
- **Standards converge before products do.** Vendors that anchor at the spec level retain optionality longer than vendors that anchor at the SDK level.
- **Honest uncertainty beats false confidence.** Inference, weak support, and open questions are first-class labels.

Saved insights persist in `localStorage`. Over many companies, the saved set becomes a longitudinal record of how the engine reads the market.
