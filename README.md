# Differentiation Reasoning Engine

An investor workbench for assessing whether a company stays differentiated as adjacent ecosystems converge.

## The problem this exists to solve

Differentiation analysis in AI markets is hard because ecosystems converge faster than they used to. A startup's wedge today is often a feature inside a hyperscaler runtime eighteen months later. The interesting investor question is rarely *"is this company building something useful"* — it is *"does the wedge survive contact with the incumbents, protocols, and standards that will absorb adjacent value over the next two to three years."*

Most research tools answer the first question and stop. This engine is built to answer the second.

## Premises

The engine operates on three premises about how AI markets actually move.

**Technical possibility is not strategic likelihood.** Most incumbents are technically capable of shipping the adjacent product. The question that matters is whether their data model, sales motion, and ecosystem incentives actually push them to do it well. Capability is cheap; intent is not. The engine separates the two explicitly in every incumbent analysis.

**Ecosystem incentives gate strategic moves.** Cross-platform neutrality is anti-incentive for hyperscalers. Identity, observability, and runtime primitives get bundled almost automatically. Standards commoditize the layer beneath them and push value upward — vendors who anchor at the spec level retain optionality longer than vendors who anchor at the SDK level.

**Synthesis beats retrieval.** A list of links is not analysis. The engine prefers a structured decomposition — what the company is architecturally, what control point it owns, what it depends on, what becomes hard for incumbents to replicate — with the underlying sources cited *below* the reasoning as supporting evidence, not above it. Inference, weak support, and open questions are first-class labels. The engine prefers honest uncertainty to false confidence.

## What the engine produces

Nine MECE sections — mutually exclusive, collectively exhaustive, each with a distinct analytical job. No section restates a prior section.

```
01  Product Decomposition          What the company does and why
02  Strategic Adjacencies          Who is adjacent and why they matter
03  Incumbent Expansion Analysis   Per-incumbent capability vs incentive
04  Startup Expansion Analysis     Per-startup wedge, roadmap, classification
05  Possible vs Likely             Technical capability vs strategic incentive
06  Differentiation Durability     Final synthesis: High / Medium / Low
07  Evidence Quality               What the engine relied on
08  What Would Change              Falsifiability of the conclusion
09  Open Diligence Questions       Next-step investor questions
    Appendix: Research Log         Raw retrieval (sources, not conclusions)
```

Saved insights persist locally in `localStorage`. Over many companies, the saved set becomes a longitudinal record of how the engine read the market — useful as the ecosystem moves and prior conclusions can be tested against subsequent events.

## Workflow

1. Enter a target company name and website.
2. Pick a research mode:
   - **Live Search** — engine fires five public-web queries through Tavily, streams results into the Research Log, auto-fills the notes box.
   - **Manual Notes** — engine reasons purely over what you paste. Useful when retrieval is unavailable or when you have higher-quality primary research (Perplexity, customer notes, Tegus transcripts, product docs).
3. Click **Run Discovery** to populate the Research Log (Live Search mode only). A loading dialog appears while Tavily fires; it dismisses on completion.
4. Click **Generate Analysis** to produce the nine-section report.
5. Click **Save Insight** to persist locally, or **Export Memo** to open a print-optimized view that the browser's print dialog saves as a PDF.

## Run locally

Self-contained `index.html`, no build step.

```
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

`/api/search` (the Tavily-backed Vercel function) is only reachable on the deployed Vercel URL. On a local origin, the discovery feed detects this and shows a single explanatory message — switch to **Manual Notes** mode to test locally.

## Deploy to Vercel

Free tier. No credit card required.

1. Push the repo to GitHub.
2. <https://vercel.com/new> → **Import Git Repository** → select the repo.
3. Framework Preset: **Other**. Root Directory: `./`. Leave Build Command and Output Directory empty.
4. **Environment Variables**:
   - Name: `TAVILY_API_KEY`
   - Value: a Tavily key from <https://tavily.com> (free tier: 1,000 searches/month, no card at signup)
5. Click **Deploy**. URL prints after ~30 seconds.

## Project layout

```
.
├── index.html       Self-contained app: UI, reasoning engine, render
├── api/
│   └── search.mjs   Vercel serverless function wrapping Tavily Search
├── vercel.json      Deploy config
└── README.md
```
