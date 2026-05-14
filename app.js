/* =========================================================
   Differentiation Reasoning Engine
   Local-first. No backend, no APIs, no fake agents.
   The "engine" is a deterministic strategic-reasoning composer:
   - detects an industry category from inputs
   - applies a structured reasoning template
   - weaves in company-specific signals from pasted notes
   - explicitly marks inference vs verified evidence
   ========================================================= */

/* ---------- 1. Category profiles ---------------------------
   Each profile encodes the architectural/strategic shape of a
   space. Profiles use {{company}} as a placeholder. They are
   templates for *reasoning*, not summaries of marketing.
----------------------------------------------------------- */

const PROFILES = {

  /* ============================================================
     AGENT IDENTITY / AGENT ACCESS / AGENT AUTHORIZATION
     ============================================================ */
  agent_identity: {
    label: "Agent identity & access",
    summary: "Authorization, delegation, and behavioral audit for AI agents acting on behalf of users or systems.",
    product: {
      technical_layer: "Identity, authorization, and audit middleware purpose-built for AI agents. Sits beneath agent runtimes and above downstream tools/APIs.",
      runtime_position: "In-path at the moment of tool invocation. Mediates per-call token issuance, scope enforcement, and decision-level logging. Likely available as SDK plus a self-hostable gateway.",
      workflow_ownership: "Owns the human → agent delegation surface, ephemeral scoped credentials, and behavioral audit trail. Does not own the LLM call itself; owns what happens at the boundary between the agent and the rest of the stack.",
      deployment_assumption: "Hybrid SDK + gateway. Developer adoption is bottom-up via SDK; enterprise adoption requires a self-hostable control plane the security org can put under change management.",
      likely_buyer: "Dual-buyer. Platform engineering / developer platform team owns integration; security and GRC organizations own approval. The latter is the harder gate but the deeper budget.",
      architectural_wedge: "Agent-native primitives where principal = human delegating to ephemeral, autonomous agent — a model that does not fit cleanly into OAuth-for-humans or service-to-service IAM token mental models.",
      ai_dependency: "Strong. Demand curve is gated on enterprise agent deployments crossing the security-review threshold. If agents stay confined to read-only retrieval, demand is muted; if agents take write actions (tickets, transactions, code commits), demand becomes urgent.",
      stack_position: "Sits between identity (Okta / Entra / Auth0), agent runtime (LangChain / OpenAI Assistants / Anthropic), and API gateway / API security (Kong / Cequence). Closest neighbors are identity and runtime."
    },
    adjacencies: {
      incumbents: [
        { name: "Okta / Auth0", note: "Identity incumbent. Already pitching 'non-human identity'. Distribution into every CISO." },
        { name: "Microsoft Entra ID", note: "Bundled with Copilot Studio and Azure OpenAI. Massive enterprise gravity." },
        { name: "Ping Identity / ForgeRock", note: "Enterprise federation incumbents. Slower-moving but deeply embedded in regulated buyers." },
        { name: "AWS IAM / Google Cloud IAM", note: "Will extend their own IAM into Bedrock Agents / Agentspace runtimes." }
      ],
      startups: [
        { name: "Anon", note: "Browser-session capture for consumer-facing agents — adjacent primitive." },
        { name: "WorkOS", note: "Enterprise auth for AI startups; explicit 'Auth for AI' line." },
        { name: "Stytch", note: "Developer auth primitives; Connected Apps shape adjacent." },
        { name: "Permit.io / Cerbos / Authzed", note: "Authorization-as-a-service policy engines; partial overlap on authz." }
      ],
      platforms: [
        { name: "LangChain / LangGraph", note: "Agent runtime SDK — primary absorption risk for identity primitives." },
        { name: "OpenAI Assistants / Responses API", note: "First-party identity primitives within OpenAI envelope." },
        { name: "Anthropic / MCP", note: "Model Context Protocol may standardize identity primitives at the protocol level." },
        { name: "Cloudflare Agents", note: "Edge agent runtime; bundling pressure for basic identity primitives." }
      ]
    },
    incumbents: [
      {
        name: "Okta",
        today: "Human SSO/MFA, non-human identity for service accounts, partner integrations, recent 'Auth for GenAI' positioning.",
        capable_of: "Per-agent identity issuance, scoped tokens, agent audit trail — they have the primitives, the federation graph, and the directory.",
        likely_to: "Layer 'non-human identity for AI' on top of existing IAM. Ship scopes-for-agents but stop short of decision-level behavioral observability.",
        architecture_constraints: "Token formats (OAuth/SAML/OIDC) assume long-lived principals; agent invocations are ephemeral. Audit assumes user-attributed events; agents need decision-attributed events.",
        ecosystem_incentives: "Defend installed IAM base. Cross-vendor neutrality is genuinely in their interest. Avoid disrupting existing federation contracts.",
        distribution: "Massive. Already in the CISO's tool stack and procurement template. Bundle gravity is the single biggest threat to any standalone."
      },
      {
        name: "Microsoft (Entra + Copilot + Azure)",
        today: "Entra ID for human and workload identity. Copilot Studio for agent building. Purview for governance. Azure OpenAI as runtime.",
        capable_of: "Owns the stack end to end. Could ship best-in-class agent identity within the Microsoft envelope.",
        likely_to: "Ship excellent agent identity inside Copilot / Azure stack. Cross-platform neutrality is anti-incentive.",
        architecture_constraints: "Optimized for the Microsoft 365 / Copilot envelope. Cross-LLM agent identity is a strategic conflict with Copilot bundling.",
        ecosystem_incentives: "Bundle into E5 / Copilot SKUs. Lock-in over neutrality.",
        distribution: "Massive within enterprise IT. Already in the buyer's environment."
      },
      {
        name: "Cloudflare",
        today: "Cloudflare Access (ZTNA), Workers, Agents platform, edge runtime.",
        capable_of: "Yes — owns edge + identity + runtime in one stack. Plausibly the most strategic adjacent in 2026.",
        likely_to: "Bundle basic agent identity into Agents platform free or near-free to drive Workers consumption.",
        architecture_constraints: "Edge-native. Less depth on enterprise IAM federation and GRC integrations.",
        ecosystem_incentives: "Bundle drives platform consumption. Free agent identity primitives expand top of funnel.",
        distribution: "Strong developer reach; growing enterprise footprint."
      },
      {
        name: "AWS / Google (hyperscalers)",
        today: "IAM plus Bedrock Agents (AWS) and Agentspace / Vertex AI Agents (Google).",
        capable_of: "Native agent identity inside their respective agent runtimes.",
        likely_to: "Ship runtime-bundled identity that works inside one cloud. Cross-cloud neutrality is anti-incentive.",
        architecture_constraints: "AWS IAM is famously complex; extensions, not greenfield. Google IAM is fragmented across GCP and Workspace.",
        ecosystem_incentives: "Drive compute consumption on their runtime; neutrality conflicts with that goal.",
        distribution: "Massive at the runtime layer. Limited at the cross-cloud control plane."
      }
    ],
    startups: [
      {
        name: "Anon",
        wedge: "Browser session capture and auth for consumer-facing agents that need to act inside SaaS apps without API auth.",
        roadmap: "Likely deeper into agent-broker authentication for SaaS apps and consumer-leaning agent platforms.",
        convergence_risk: "Medium. Different primitive (session capture) but adjacent buyer and overlapping narrative.",
        role: "complement"
      },
      {
        name: "WorkOS",
        wedge: "Enterprise SSO and directory sync for AI startups; already shipping 'Auth for AI' primitives.",
        roadmap: "Expanding into agent-facing authz; high developer mindshare in AI startup ecosystem.",
        convergence_risk: "High. Direct developer-audience overlap.",
        role: "competitor"
      },
      {
        name: "Permit.io / Cerbos / Authzed",
        wedge: "Authorization-as-a-service policy engines (RBAC/ABAC/ReBAC).",
        roadmap: "Will add agent-specific policy primitives; deep on authz but not on identity issuance or runtime audit.",
        convergence_risk: "High on the authz boundary specifically; low on identity issuance.",
        role: "competitor"
      },
      {
        name: "LangChain / LangGraph",
        wedge: "Agent runtime SDK; broader product surface than identity.",
        roadmap: "SDKs have historical pattern of absorbing 'good enough' versions of adjacent primitives once usage signal is clear.",
        convergence_risk: "High — framework absorption is the canonical risk for any agent-adjacent vendor.",
        role: "competitor"
      },
      {
        name: "Stytch",
        wedge: "Developer-friendly auth primitives; Connected Apps shape adjacent to agent delegation.",
        roadmap: "Continues to broaden into B2B and AI app authz.",
        convergence_risk: "Medium. Broader auth focus than agent-specific.",
        role: "competitor"
      }
    ],
    vs_analysis: [
      {
        actor: "Okta",
        possible: "Build agent-native runtime audit with decision-level granularity; cross-LLM neutrality; deep delegation primitives.",
        likely: "Layer 'non-human identity for AI' on top of existing IAM; ship scopes-for-agents; stop short of behavioral runtime observability.",
        constraint: "Architecture inherits OAuth/SAML token-format assumptions. Sales motion optimized for IAM RFP, not for agent-runtime decisions. Reorganizing around a new principal model would disrupt their installed base."
      },
      {
        actor: "Microsoft",
        possible: "Cross-platform agent identity standard usable outside the Microsoft envelope.",
        likely: "Best-in-class agent identity inside Copilot + Azure; cross-vendor identity only where it does not dilute bundle value.",
        constraint: "Strategic value is the bundle. Cross-platform neutrality is structurally anti-incentive. Customers outside the Microsoft stack will not get equal product depth."
      },
      {
        actor: "LangChain / LangGraph",
        possible: "Robust enterprise-grade identity and audit primitives shipped natively with the runtime.",
        likely: "Lightweight identity primitives sufficient for prototyping; defer enterprise auth, GRC integrations, and audit depth to partners.",
        constraint: "Identity is not a wedge for an SDK company. Security and compliance product surface is heavy and slow; framework velocity benefits from offloading it."
      },
      {
        actor: "Cloudflare",
        possible: "Full agent-runtime identity with edge-native auth and runtime audit integrated into Workers + Agents.",
        likely: "Basic agent identity primitives bundled into Agents platform; relies on partners for enterprise IAM federation and GRC.",
        constraint: "Edge-first architecture. Enterprise IAM federation, SCIM, and audit reporting are not the cultural strength."
      },
      {
        actor: "OpenAI / Anthropic",
        possible: "First-class agent identity primitives in their SDKs spanning third-party tools and external runtimes.",
        likely: "Identity primitives strong inside their own runtime envelope; cross-vendor identity is structurally anti-incentive.",
        constraint: "Each ecosystem benefits from lock-in. A neutral agent identity layer is orthogonal to their goals and would be deprioritized vs model and runtime investment."
      }
    ],
    durability: {
      level: "medium",
      differentiated_today: "Likely yes. Agent-native primitives are scarce in the market; most adjacent vendors extend OAuth-for-humans patterns. The combination of per-agent identity, ephemeral scoped tokens, and decision-level audit is not a default offering anywhere.",
      durable_parts: [
        "Cross-runtime, cross-LLM neutrality (structurally anti-incentive for hyperscalers and frameworks)",
        "Decision-level behavioral audit (vs request-level logging)",
        "Purpose-built primitives for human → agent delegation",
        "Enterprise GRC integration (SOC2 / NIST AI RMF / regulator-readable audit)"
      ],
      commoditizing_parts: [
        "Basic token issuance and short-lived credentials",
        "Simple OAuth-style consent flows",
        "Scope models for read-only retrieval agents"
      ],
      absorbable_parts: [
        "Anything wrapped tightly around a single hyperscaler runtime",
        "Lightweight SDK conveniences that frameworks will replicate",
        "Vanilla authz policy primitives where Cerbos / OPA already win"
      ],
      survivability_moves: [
        "Become standard at the SDK / framework integration layer — be the default when LangChain / CrewAI users add auth",
        "Anchor on MCP and emerging agent protocols at the spec level (not just implementation)",
        "Ship the GRC / audit deliverable (regulator-readable evidence packages) that incumbents will not ship quickly",
        "Cross-LLM, cross-runtime neutrality as the brand position and the technical posture",
        "Land a flagship regulated customer (financial services or healthcare) and build the audit case study"
      ],
      confidence: "Medium. Depends heavily on (a) the enterprise agent deployment curve, (b) whether MCP-style protocols standardize identity primitives, and (c) whether the buyer settles as security or platform engineering. Public evidence on customer depth in this category is limited."
    },
    reasoning: [
      {
        conclusion: "Agent identity is structurally different from human IAM, not a layer on top of it.",
        signals: ["principal-model: human → ephemeral agent", "token-lifecycle: per-task, not per-session", "audit-unit: decision, not request", "delegation pattern absent from OAuth 2.x"]
      },
      {
        conclusion: "Hyperscalers and runtime providers will bundle basic agent identity into their own envelopes.",
        signals: ["Cloudflare Agents", "Bedrock Agents", "Copilot Studio", "platform-incentive: drive runtime consumption", "historical pattern: runtimes absorb adjacent primitives"]
      },
      {
        conclusion: "Framework absorption is the canonical risk for agent-adjacent primitives.",
        signals: ["LangChain absorbed retrieval", "LangSmith absorbed observability", "SDK velocity rewards bundling 'good enough'"]
      },
      {
        conclusion: "Buyer ambiguity is the largest non-technical risk in 2026.",
        signals: ["dual-buyer: CISO vs platform-eng", "category not in Gartner / Forrester taxonomy yet", "no settled procurement template"]
      },
      {
        conclusion: "Differentiation is durable but not invulnerable.",
        signals: ["depth of audit", "cross-vendor neutrality", "GRC integration", "all require sustained investment to stay ahead of bundling"]
      }
    ],
    risks: [
      { name: "Hyperscaler bundling", detail: "Cloudflare, AWS, Microsoft, Google ship 'good enough' agent identity inside their own runtimes; commoditizes basic primitives." },
      { name: "Framework absorption", detail: "LangChain / LangGraph / OpenAI Assistants ship native identity primitives sufficient for 80% of use cases." },
      { name: "Identity incumbent expansion", detail: "Okta or Microsoft ships agent-identity SKUs that are 70% of the product at 30% of the procurement friction." },
      { name: "Category ambiguity", detail: "Without a recognized category, procurement is bespoke and slow." },
      { name: "Buyer ambiguity", detail: "Security and platform engineering each think the other owns it; deals stall in cross-functional review." },
      { name: "Protocol commoditization", detail: "MCP or successor protocol standardizes identity primitives at the spec level; vendor-specific value evaporates." },
      { name: "Distribution asymmetry", detail: "Incumbents have a pre-existing line into the buyer; standalone has to manufacture trust on every deal." },
      { name: "Open-source authz pressure", detail: "OPA / Cerbos / SpiceDB pull the authz layer toward open-source defaults." }
    ],
    questions: [
      "Who is the buyer in the top 5 closed deals — security, platform engineering, or an AI center of excellence?",
      "What is the integration depth in production deployments — SDK only, gateway, runtime middleware, or sidecar?",
      "What is the audit granularity actually shipped — request-level, decision-level, or reasoning-trace-level?",
      "How is human → agent delegation modeled in the data model? What primitive represents a 'delegated scope with provenance'?",
      "What is the stance on MCP and emerging agent protocols? Are they implementers, contributors, or neutral?",
      "What is the GTM motion — bottom-up developer adoption converting to enterprise, or top-down CISO?",
      "What is the deployment posture — SaaS only, self-hostable control plane, or fully on-prem? Critical for regulated buyers.",
      "How does the product behave when LangChain and OpenAI Assistants are both in production at the same customer?",
      "What customer evidence exists for real audit depth versus marketing claims? Any regulator-facing artifacts?",
      "What is the team's IAM background — net-new perspective on agent identity, or ex-Okta / ex-Auth0 carrying old assumptions?",
      "What is the open-source position? Is the SDK open, the gateway, the policy engine, or none?",
      "What does displacement look like when Okta or Microsoft ships their version — does the customer rip it out or run it alongside?"
    ]
  },

  /* ============================================================
     AGENT OBSERVABILITY / LLM EVALS / TRACING
     ============================================================ */
  agent_observability: {
    label: "Agent observability & evals",
    summary: "Tracing, evaluation, and quality observability for LLM applications and multi-step agent workflows.",
    product: {
      technical_layer: "Application-level observability for LLM and agent workflows. Captures prompt-response traces, intermediate tool calls, agent decision steps, and evaluation outcomes.",
      runtime_position: "Out-of-path observer in development; in-path for guardrails / online evals in production. SDK instrumentation plus a centralized store and UI for traces and evals.",
      workflow_ownership: "Owns the evaluation surface (offline test sets, online live evals, regression detection), the trace store, and increasingly the prompt-management workflow.",
      deployment_assumption: "Cloud SaaS by default. Self-hostable tier for regulated buyers. OpenTelemetry-compatible trace export as table stakes by 2026.",
      likely_buyer: "AI engineering team or applied ML team owns adoption. Platform engineering owns scaling. As deployments mature, the workflow becomes a release-gate the engineering org cannot ship without.",
      architectural_wedge: "Evals-as-first-class-citizen alongside traces. Decoupling 'how do I know this is working' from 'how do I see what happened' — a primitive that traditional APM does not model.",
      ai_dependency: "Total. The category does not exist without LLM-based applications. Growth pace tracks production agent deployment depth.",
      stack_position: "Sits adjacent to traditional APM (Datadog, New Relic, Honeycomb), the LLM SDK (LangChain / LlamaIndex), and the eval/safety layer (Patronus, Galileo, hyperscaler guardrails)."
    },
    adjacencies: {
      incumbents: [
        { name: "Datadog", note: "APM incumbent with growing LLM observability product surface. Will bundle into existing footprint." },
        { name: "New Relic", note: "Similar APM dynamics; lighter LLM-specific narrative." },
        { name: "Honeycomb", note: "Observability incumbent with strong tracing primitives; natural extension into LLM traces." },
        { name: "Splunk / Cisco", note: "Logs and security-flavored observability; slower-moving but enterprise-embedded." }
      ],
      startups: [
        { name: "LangSmith (LangChain)", note: "Framework-bundled observability; massive distribution via the LangChain SDK." },
        { name: "Langfuse", note: "OSS-first observability; strong developer mindshare." },
        { name: "Helicone", note: "Proxy-based observability; OSS-friendly." },
        { name: "Arize", note: "ML observability incumbent extending into LLMs and agents." },
        { name: "Braintrust", note: "Evals-first positioning; developer-experience-led." },
        { name: "Patronus / Galileo / Humanloop", note: "Eval and quality-scoring specialists." }
      ],
      platforms: [
        { name: "OpenAI", note: "Built-in evals in the platform; weakens need for third-party eval tooling within OpenAI envelope." },
        { name: "Anthropic Workbench", note: "First-party prompt + eval workflow." },
        { name: "Azure AI Foundry / AWS Bedrock / Vertex AI", note: "Runtime-bundled evaluation and tracing inside hyperscaler stacks." },
        { name: "OpenTelemetry GenAI semantic conventions", note: "Protocol-level commoditization pressure on trace format and instrumentation." }
      ]
    },
    incumbents: [
      {
        name: "Datadog",
        today: "LLM Observability product line, model monitoring, integrations with major model providers.",
        capable_of: "Full LLM trace, eval, and prompt management — they have the storage, the UI, and the buyer.",
        likely_to: "Ship deeper LLM observability bundled into existing APM SKUs; sufficient for 80% of mainstream enterprise buyers.",
        architecture_constraints: "APM data model centers on services and traces; eval-as-first-class-primitive is a non-trivial extension.",
        ecosystem_incentives: "Defend installed base; bundle LLM into seat license. Cross-vendor neutrality is natural for them.",
        distribution: "Massive. Already in the platform-engineering procurement template."
      },
      {
        name: "Honeycomb",
        today: "Tracing-first observability with strong OpenTelemetry alignment.",
        capable_of: "Native LLM tracing via OTel GenAI conventions; lightweight eval workflow.",
        likely_to: "Ship LLM tracing with strong OTel posture; eval workflow likely shallower than specialists.",
        architecture_constraints: "Eval is a different primitive from trace; integrating it deeply requires product reshaping.",
        ecosystem_incentives: "OSS-friendly OTel alignment is a credible differentiator.",
        distribution: "Strong developer mindshare; smaller enterprise footprint than Datadog."
      },
      {
        name: "Arize",
        today: "ML observability incumbent (Phoenix OSS); strong on classical ML monitoring; expanding into LLMs and agents.",
        capable_of: "Bridge between ML observability and LLM observability is a real strength.",
        likely_to: "Compete head-on with LLM-observability specialists; strong on data-science buyer; less developer-first.",
        architecture_constraints: "ML data model and LLM data model don't fully overlap; product surface is bifurcating.",
        ecosystem_incentives: "Phoenix OSS expands top of funnel; commercial product captures enterprise.",
        distribution: "Strong with ML / data-science teams; growing developer reach."
      },
      {
        name: "Microsoft / AWS / Google (hyperscalers)",
        today: "Built-in tracing, evals, and guardrails inside Azure AI Foundry, AWS Bedrock, and Vertex AI.",
        capable_of: "Excellent runtime-bundled observability inside their own runtimes.",
        likely_to: "Ship deeper observability that is sufficient for customers who stay within one cloud's runtime.",
        architecture_constraints: "Runtime-bundled observability is weakest when the customer uses multiple runtimes.",
        ecosystem_incentives: "Drive runtime consumption; cross-cloud neutrality is anti-incentive.",
        distribution: "Massive at the runtime layer."
      }
    ],
    startups: [
      {
        name: "LangSmith",
        wedge: "Framework-bundled observability for LangChain users; massive distribution via the SDK.",
        roadmap: "Already broadening into evals and prompt management; the framework distribution advantage is structural.",
        convergence_risk: "High. Framework absorption is the single largest competitive force in this category.",
        role: "competitor"
      },
      {
        name: "Langfuse",
        wedge: "OSS-first observability with strong developer mindshare and self-host posture.",
        roadmap: "Continued OSS-led growth; commercial cloud tier for enterprise.",
        convergence_risk: "Medium-high. OSS posture is durable, but commercial monetization is the harder game.",
        role: "competitor"
      },
      {
        name: "Braintrust / Humanloop",
        wedge: "Evals-first positioning, strong DX for prompt engineering teams.",
        roadmap: "Deeper into eval orchestration and prompt management; less depth on production trace volume.",
        convergence_risk: "Medium. Evals-first is a real wedge but the evaluation primitive is at risk of commoditization by frameworks and hyperscalers.",
        role: "competitor"
      },
      {
        name: "Patronus / Galileo",
        wedge: "Quality-scoring and hallucination-detection specialists; safety / eval flavor.",
        roadmap: "Adjacent but increasingly overlapping; convergence with observability vendors over time.",
        convergence_risk: "Medium. Specialist eval depth may converge with general observability.",
        role: "complement"
      }
    ],
    vs_analysis: [
      {
        actor: "Datadog",
        possible: "Ship a full LLM observability + evals + prompt-management product equal to category specialists.",
        likely: "Ship 'good enough' LLM trace + monitoring bundled into APM; eval and prompt workflow shallow vs specialists.",
        constraint: "APM data model centers on services; eval-as-first-class-primitive is a different shape. Investment must compete with core APM roadmap."
      },
      {
        actor: "OpenAI / Anthropic",
        possible: "Best-in-class evals, traces, and prompt management within their runtime envelopes.",
        likely: "Strong inside their own envelope; cross-model observability is anti-incentive.",
        constraint: "Each model lab benefits when developers stay inside their workbench. Multi-model observability is orthogonal to model-business strategy."
      },
      {
        actor: "LangChain (LangSmith)",
        possible: "Framework-bundled observability and evals that absorb the bulk of category demand.",
        likely: "Continues to absorb adjacent primitives; observability bundling already underway.",
        constraint: "Captive to LangChain-shaped agents; less competitive when teams use other frameworks or build custom runtimes."
      },
      {
        actor: "OpenTelemetry community",
        possible: "GenAI semantic conventions standardize trace format across vendors.",
        likely: "Already happening; will commoditize raw tracing while leaving evals and prompt management open.",
        constraint: "OTel is a standard, not a product. Standards commoditize the layer beneath them and push value upward."
      }
    ],
    durability: {
      level: "medium",
      differentiated_today: "Partial. Eval-first and trace-first specialists offer real depth that incumbents do not match. But the category has many credible players; differentiation is product-quality and category-narrative, not structural.",
      durable_parts: [
        "Eval primitive as a first-class object (not a bolted-on dashboard)",
        "Cross-framework, cross-model neutrality",
        "Production-grade trace storage at scale with rich filtering",
        "Workflow integration with CI/CD (evals as release gates)"
      ],
      commoditizing_parts: [
        "Raw trace capture (OTel GenAI conventions)",
        "Basic prompt-versioning",
        "Generic dashboards"
      ],
      absorbable_parts: [
        "Anything LangSmith will ship inside the LangChain envelope",
        "Anything Datadog will bundle into APM",
        "Hyperscaler-specific runtime observability"
      ],
      survivability_moves: [
        "Own evals as the primary product surface, not traces",
        "Win the release-gate workflow: be the system the team cannot ship without",
        "Cross-framework neutrality and strong OpenAI / Anthropic / Bedrock / Vertex integrations",
        "Deep IDE / CI integrations that make evals a developer reflex"
      ],
      confidence: "Medium. Category is crowded and converging on similar feature sets. Differentiation comes more from execution velocity, developer experience, and integration depth than from architectural moat."
    },
    reasoning: [
      {
        conclusion: "Traces are commoditizing; evals are the durable wedge.",
        signals: ["OTel GenAI semantic conventions", "every APM ships traces", "evals require domain modeling specific to AI use cases"]
      },
      {
        conclusion: "Framework bundling is the largest single competitive force.",
        signals: ["LangSmith distribution via LangChain SDK", "OpenAI built-in evals", "Anthropic Workbench"]
      },
      {
        conclusion: "Buyer is fragmented across AI eng, platform eng, and data science.",
        signals: ["product surfaces differ by buyer", "DX-led products win developer first", "data-science-led products win ML buyer first"]
      }
    ],
    risks: [
      { name: "Framework bundling", detail: "LangSmith and equivalents bundle observability into the SDK; default for framework users." },
      { name: "APM incumbent bundling", detail: "Datadog / New Relic ship 'good enough' LLM observability inside existing seat licenses." },
      { name: "Hyperscaler runtime bundling", detail: "Bedrock / Vertex / Azure AI Foundry ship runtime-native observability." },
      { name: "OpenTelemetry commoditization", detail: "GenAI conventions standardize trace format; raw tracing layer becomes a commodity." },
      { name: "Category crowding", detail: "10+ credible vendors; differentiation depends on execution and DX, not architecture." },
      { name: "Buyer ambiguity", detail: "AI eng vs platform eng vs data science; procurement is bespoke." }
    ],
    questions: [
      "What share of new ARR is driven by evals workflows vs trace volume?",
      "How does the product behave when the customer uses multiple agent frameworks at once?",
      "What is the OpenTelemetry posture — embrace, extend, or proprietary?",
      "Is the product a release gate in production at any flagship customers, or is it diagnostic-only?",
      "How does the eval primitive model regressions, drift, and online safety in one data model?",
      "What is the customer's path when Datadog ships an equivalent feature inside their existing seat license?",
      "What is the developer-experience advantage that drives bottom-up adoption?",
      "How is the product priced — by trace volume, by eval run, or by seat? Each has different scaling characteristics."
    ]
  },

  /* ============================================================
     VOICE AGENTS / CONVERSATIONAL VOICE INFRASTRUCTURE
     ============================================================ */
  voice_agent: {
    label: "Voice agents",
    summary: "Real-time voice AI for inbound/outbound calls, contact center automation, and voice-first agent workflows.",
    product: {
      technical_layer: "Real-time voice runtime: ASR + LLM reasoning + TTS + turn-taking + telephony orchestration. Latency budget is the central engineering constraint.",
      runtime_position: "In-path on every call. Owns the conversational state machine, barge-in handling, and tool calls during the conversation.",
      workflow_ownership: "Owns the call surface and the post-call disposition / handoff. Increasingly owns CRM write-back and downstream workflow triggers.",
      deployment_assumption: "Cloud SaaS with SIP / WebRTC integrations to telephony providers and CCaaS suites.",
      likely_buyer: "Operations leader or VP customer experience for end-to-end voice agent products; developer / platform-engineering for voice-AI infrastructure plays.",
      architectural_wedge: "End-to-end latency optimization, telephony depth, and verticalized conversation modeling — depending on the layer the company plays at.",
      ai_dependency: "Total. The category is created by LLMs becoming capable enough to handle live conversation.",
      stack_position: "Sits between telephony (Twilio, Plivo), CCaaS incumbents (Genesys, NICE, Five9), and the LLM model providers."
    },
    adjacencies: {
      incumbents: [
        { name: "Genesys / NICE / Five9", note: "CCaaS incumbents; bundling voice AI into existing seat licenses." },
        { name: "Twilio", note: "Telephony infrastructure with Flex CCaaS and ConversationRelay voice AI primitives." },
        { name: "Amazon Connect / Google CCAI / Microsoft Digital Contact Center", note: "Hyperscaler CCaaS bundles." },
        { name: "Salesforce Service Cloud Voice", note: "CRM-tethered voice; embedded distribution into Salesforce installed base." }
      ],
      startups: [
        { name: "Vapi / Retell / Bland", note: "Voice-AI infrastructure plays — turn-key voice agent runtimes." },
        { name: "ElevenLabs", note: "TTS leader extending into voice agent runtimes." },
        { name: "Sierra / Decagon / Parloa", note: "Verticalized voice agent products for CX." },
        { name: "Deepgram / AssemblyAI", note: "ASR specialists likely to extend further into the agent runtime." }
      ],
      platforms: [
        { name: "OpenAI Realtime API", note: "Native speech-to-speech model collapses the ASR+TTS+LLM stack." },
        { name: "Google Live API / Gemini Live", note: "Equivalent for Google." },
        { name: "AWS Sonic / Polly + Lex", note: "Hyperscaler voice primitives." }
      ]
    },
    incumbents: [
      {
        name: "Genesys / NICE / Five9",
        today: "CCaaS suites with growing AI offerings (Genesys Cloud AI, NICE Enlighten, Five9 AI Studio).",
        capable_of: "Embed voice AI deeply into existing contact center workflows; access to historical call data and integrations is a real moat.",
        likely_to: "Bundle voice AI into existing CCaaS SKUs; defend installed base.",
        architecture_constraints: "Legacy stacks; latency-sensitive integrations are non-trivial retrofits.",
        ecosystem_incentives: "Defend seat-license business; AI as expansion lever within existing accounts.",
        distribution: "Massive in enterprise contact centers."
      },
      {
        name: "Twilio",
        today: "Telephony infrastructure, Flex CCaaS, ConversationRelay voice AI primitive.",
        capable_of: "Owns the telephony substrate; can bundle voice AI as a logical extension.",
        likely_to: "Position as the neutral infrastructure for voice agent builders; defer end-product to partners.",
        architecture_constraints: "Lower in the stack; less customer-experience product gravity than CCaaS suites.",
        ecosystem_incentives: "Drive telephony consumption; voice AI as a usage multiplier.",
        distribution: "Massive developer reach via SDK."
      },
      {
        name: "Hyperscalers (Amazon Connect, Google CCAI, Microsoft DCC)",
        today: "Cloud-native CCaaS with AI bundling.",
        capable_of: "Native speech models (Sonic, Live API) collapse the stack; deep CCaaS integration is the bundle play.",
        likely_to: "Bundle voice AI as a default capability of their CCaaS suites.",
        architecture_constraints: "CCaaS adoption lags telephony incumbents in many enterprises.",
        ecosystem_incentives: "Drive cloud and model consumption.",
        distribution: "Strong via existing cloud relationships."
      },
      {
        name: "Salesforce / ServiceNow",
        today: "CRM and ITSM voice and agent product surfaces.",
        capable_of: "CRM-tethered voice with deep workflow integration.",
        likely_to: "Ship voice AI as part of Agentforce / Now Assist; CRM lock-in is the leverage.",
        architecture_constraints: "Voice is a thinner layer; depth depends on partner ecosystem.",
        ecosystem_incentives: "Pull workflows toward their platform.",
        distribution: "Massive enterprise gravity."
      }
    ],
    startups: [
      {
        name: "Vapi / Retell / Bland",
        wedge: "Turn-key voice agent infrastructure with telephony integrations and SDKs.",
        roadmap: "Deeper telephony coverage, lower latency, better function calling, vertical accelerators.",
        convergence_risk: "High among themselves; medium against OpenAI Realtime which collapses parts of the stack.",
        role: "competitor"
      },
      {
        name: "ElevenLabs",
        wedge: "TTS leader extending into full voice agent runtimes.",
        roadmap: "Continued voice quality lead plus runtime expansion.",
        convergence_risk: "Medium. TTS quality is a real wedge but model labs are catching up via speech-to-speech.",
        role: "competitor"
      },
      {
        name: "Sierra / Decagon / Parloa",
        wedge: "Verticalized voice + chat agent products for CX use cases.",
        roadmap: "Deeper vertical depth; outcome-based pricing; CCaaS displacement narratives.",
        convergence_risk: "Different layer (end product vs infrastructure). Low direct convergence with infra players.",
        role: "complement"
      },
      {
        name: "Deepgram / AssemblyAI",
        wedge: "ASR specialists with low-latency streaming.",
        roadmap: "Extending into agent runtime adjacencies.",
        convergence_risk: "Medium. Speech-to-speech models from labs threaten the ASR layer's value capture.",
        role: "complement"
      }
    ],
    vs_analysis: [
      {
        actor: "OpenAI / Google (model labs)",
        possible: "Speech-to-speech models that collapse the ASR + reasoning + TTS stack into one model call.",
        likely: "Continued model improvements at the runtime layer; less likely to ship full telephony + CCaaS product.",
        constraint: "Model labs benefit from API consumption, not product. Telephony, dialer logistics, and CX workflows are not their core competence."
      },
      {
        actor: "Twilio",
        possible: "Bundle a full voice agent runtime with deep telephony and CCaaS integration.",
        likely: "Ship infrastructure-grade primitives; defer end-product to partners to avoid channel conflict.",
        constraint: "Twilio's wholesale telephony customer base partly overlaps with voice-agent builders; product moves up-stack risk channel conflict."
      },
      {
        actor: "Genesys / NICE / Five9",
        possible: "Best-in-class voice AI deeply integrated with their CCaaS workflows.",
        likely: "Solid AI bundled into existing seat licenses; deep on workflow integration, shallower on cutting-edge model performance.",
        constraint: "Legacy architecture and quarterly release cadence are anti-correlated with frontier latency engineering."
      },
      {
        actor: "Hyperscalers",
        possible: "Speech-to-speech bundled into CCaaS suites with model and telephony in one stack.",
        likely: "CCaaS-bundled voice AI sufficient for cloud-native customers; less competitive at the top of the enterprise market.",
        constraint: "CCaaS adoption is uneven; many enterprises remain on Genesys / NICE."
      }
    ],
    durability: {
      level: "medium",
      differentiated_today: "Varies sharply by layer. Voice infrastructure players are differentiated on latency and telephony depth today. End-product / verticalized players are differentiated on workflow depth.",
      durable_parts: [
        "Telephony integration depth (SIP, carrier relationships, regulatory compliance)",
        "Sub-second end-to-end latency engineering",
        "Vertical workflow knowledge (collections, scheduling, FNOL, etc.)",
        "Outcome-based commercial models that align with buyer ROI"
      ],
      commoditizing_parts: [
        "Raw ASR and TTS quality (model labs and OSS catching up)",
        "Basic conversation orchestration",
        "Simple function-calling integrations"
      ],
      absorbable_parts: [
        "Anything inside one CCaaS envelope",
        "Anything the model lab's speech-to-speech subsumes"
      ],
      survivability_moves: [
        "Move from infrastructure to verticalized product (or vice versa, depending on starting point)",
        "Own the telephony substrate or partner deeply with it",
        "Capture the dispositioning / CRM write-back workflow, not just the call",
        "Outcome-based pricing that decouples value from per-minute cost"
      ],
      confidence: "Medium. Model lab moves (Realtime API, Live API) are reshaping the stack faster than CCaaS bundling. Durability depends on which layer the company plays at."
    },
    reasoning: [
      {
        conclusion: "Stack is collapsing at the model layer (speech-to-speech).",
        signals: ["OpenAI Realtime API", "Google Live API", "model-lab speech investments"]
      },
      {
        conclusion: "CCaaS incumbent bundling is the larger threat than hyperscaler bundling in the short term.",
        signals: ["Genesys / NICE / Five9 installed base", "switching costs in contact center", "bundling AI into existing seat licenses"]
      },
      {
        conclusion: "Voice AI infrastructure layer is more compressed than voice AI product layer.",
        signals: ["model-lab speech-to-speech compression", "CCaaS bundling of telephony + AI", "vertical product workflow defensibility"]
      }
    ],
    risks: [
      { name: "Model lab stack collapse", detail: "Speech-to-speech models from labs compress ASR + TTS + reasoning into a single call." },
      { name: "CCaaS incumbent bundling", detail: "Genesys / NICE / Five9 ship AI inside seat licenses." },
      { name: "Telephony channel conflict", detail: "Twilio and equivalents move up-stack." },
      { name: "Commoditization of basic conversation orchestration", detail: "Frameworks and OSS catch up quickly." },
      { name: "Outcome-based pricing pressure", detail: "Buyers expect per-success pricing as the category matures." },
      { name: "Regulatory exposure", detail: "TCPA, AI disclosure rules, and consent regulations add per-vertical compliance overhead." }
    ],
    questions: [
      "What layer of the stack does the company play at — infra, runtime, end-product, vertical?",
      "What is the end-to-end latency P50 and P95 in production?",
      "What is the telephony / SIP integration depth — direct carriers, Twilio-mediated, or in-app voice only?",
      "How does the product compete with OpenAI Realtime API for use cases that don't need telephony?",
      "What is the CRM and downstream workflow integration — does the product write back automatically, or stop at the call?",
      "What is the commercial model — per-minute, per-resolution, or per-outcome?",
      "How does the product handle regulated verticals (collections, healthcare, financial services)?",
      "What is the gross margin profile at scale — model cost is the dominant variable cost."
    ]
  },

  /* ============================================================
     CODE AI / AI-NATIVE DEV TOOLS
     ============================================================ */
  code_ai: {
    label: "Code AI / AI-native dev tools",
    summary: "AI-assisted and AI-autonomous coding — from IDE-native assistance to background SWE agents.",
    product: {
      technical_layer: "AI-assisted or AI-autonomous coding runtime. Spans IDE-native completion, repo-aware reasoning, multi-file edits, and long-running background SWE agents.",
      runtime_position: "Either in-IDE (latency-sensitive, foreground) or cloud-runtime (long-horizon, background). The product shape depends sharply on which.",
      workflow_ownership: "Owns some segment of the SDLC: completion, code review, refactor, multi-file change, full ticket-to-PR autonomy.",
      deployment_assumption: "IDE plugin or cloud-runtime SaaS. Self-hosted tier becoming table stakes for regulated buyers.",
      likely_buyer: "Developers (bottom-up), platform engineering or developer-productivity teams (top-down), CTO (enterprise).",
      architectural_wedge: "Either IDE-native developer experience (foreground UX moat) or background-agent capability (long-horizon task moat). Few credible players succeed at both.",
      ai_dependency: "Total.",
      stack_position: "Sits between the IDE (VS Code, JetBrains, Cursor's own), the model provider, the code-hosting platform (GitHub, GitLab), and CI/CD."
    },
    adjacencies: {
      incumbents: [
        { name: "GitHub Copilot (Microsoft)", note: "Distribution moat via VS Code and GitHub; deep model + product integration." },
        { name: "JetBrains AI / GitLab Duo", note: "IDE / SCM incumbents shipping native AI." },
        { name: "Atlassian", note: "SDLC adjacency via Jira / Bitbucket; AI rollout across the suite." }
      ],
      startups: [
        { name: "Cursor", note: "IDE-native player with strong developer mindshare." },
        { name: "Cognition (Devin)", note: "Background autonomous SWE agent." },
        { name: "Codeium / Windsurf", note: "Free-tier IDE assist with enterprise tier." },
        { name: "Sweep / Aider / OpenDevin", note: "Repo-aware automation and OSS." },
        { name: "Replit / StackBlitz", note: "Cloud dev environment + AI." }
      ],
      platforms: [
        { name: "Anthropic Claude (Sonnet/Opus for code)", note: "Strong coding models; partner of choice for many code AI vendors." },
        { name: "OpenAI Codex / GPT-4o code", note: "Equivalent at OpenAI." },
        { name: "AWS Q Developer / Google Code Assist", note: "Hyperscaler bundled developer AI." }
      ]
    },
    incumbents: [
      {
        name: "Microsoft (GitHub Copilot + VS Code)",
        today: "Largest developer AI footprint by orders of magnitude. Copilot Workspace, Copilot Coding Agent, deep model + product integration.",
        capable_of: "Best-in-class IDE-native experience plus background agent capabilities.",
        likely_to: "Continue absorbing adjacent categories (review, multi-file edit, autonomous agents) into Copilot.",
        architecture_constraints: "GitHub-tethered; less neutral with respect to GitLab / Bitbucket buyers.",
        ecosystem_incentives: "Drive GitHub seat and Azure consumption.",
        distribution: "Massive. The default for any organization already on GitHub."
      },
      {
        name: "JetBrains",
        today: "Native AI Assistant inside the JetBrains IDE family.",
        capable_of: "Deep IDE integration in a developer base that does not live in VS Code.",
        likely_to: "Continue native AI investment; less likely to compete on autonomous-agent frontier.",
        architecture_constraints: "Locked to JetBrains IDE family; cross-IDE neutrality is anti-incentive.",
        ecosystem_incentives: "Defend JetBrains seat license.",
        distribution: "Strong in enterprise Java / Python and quant finance."
      },
      {
        name: "GitLab",
        today: "Duo AI suite across SCM, CI/CD, and security.",
        capable_of: "End-to-end SDLC AI within the GitLab envelope.",
        likely_to: "Bundle deeply into existing seat licenses.",
        architecture_constraints: "GitLab-only; less neutral.",
        ecosystem_incentives: "Drive GitLab seat expansion.",
        distribution: "Strong in regulated enterprises preferring self-hosted SCM."
      },
      {
        name: "AWS / Google",
        today: "Q Developer (AWS) and Code Assist (Google) bundled into hyperscaler dev tooling.",
        capable_of: "Bundled developer AI inside their respective IDE plugins and cloud dev environments.",
        likely_to: "Bundle into cloud consumption; less competitive at the developer-experience frontier.",
        architecture_constraints: "Cloud-tethered; less competitive on cross-cloud neutrality.",
        ecosystem_incentives: "Drive cloud consumption.",
        distribution: "Strong inside hyperscaler-committed enterprises."
      }
    ],
    startups: [
      {
        name: "Cursor",
        wedge: "Forked IDE with native AI; strong developer DX; bottom-up adoption.",
        roadmap: "Continued IDE depth; background agent capabilities; enterprise rollout.",
        convergence_risk: "Direct competitor to Copilot; Copilot's distribution is structural.",
        role: "competitor"
      },
      {
        name: "Cognition (Devin)",
        wedge: "Background autonomous SWE agent positioned as a virtual engineer.",
        roadmap: "Deeper long-horizon task capability; enterprise rollout.",
        convergence_risk: "Direct competitor to Copilot Coding Agent and equivalent.",
        role: "competitor"
      },
      {
        name: "Codeium / Windsurf",
        wedge: "Free-tier IDE assist plus enterprise-grade self-host.",
        roadmap: "Continued multi-IDE coverage; enterprise depth.",
        convergence_risk: "Squeezed between Copilot at the top and OSS at the bottom.",
        role: "competitor"
      },
      {
        name: "Sweep / Aider / OpenDevin",
        wedge: "OSS or OSS-adjacent autonomous and repo-aware tools.",
        roadmap: "OSS-led adoption; commercial monetization is the harder game.",
        convergence_risk: "OSS pressure on the autonomous-agent layer.",
        role: "complement"
      }
    ],
    vs_analysis: [
      {
        actor: "Microsoft (Copilot)",
        possible: "Match every startup feature given GitHub + VS Code + Azure + OpenAI integration.",
        likely: "Continue absorbing adjacent categories; ship 'good enough' features at unmatched distribution.",
        constraint: "Quality at the frontier sometimes lags specialist startups; speed of innovation in a 100k+ org is structurally slower than a 200-person company."
      },
      {
        actor: "Anthropic / OpenAI",
        possible: "Ship full developer products that compete with their partners.",
        likely: "Stay primarily at the model layer; ship developer surfaces (Anthropic Workbench, Codex) but defer end-product to partners.",
        constraint: "Channel conflict with partners; product depth in coding requires sustained product investment that competes with model R&D."
      },
      {
        actor: "Cursor / Codeium / Cognition",
        possible: "Win the developer-experience frontier at the IDE or agent layer.",
        likely: "Win individual segments via better DX or capability; long-term durability depends on enterprise depth and platform breadth.",
        constraint: "Distribution disadvantage vs Copilot is structural; must compete on velocity and DX."
      }
    ],
    durability: {
      level: "medium",
      differentiated_today: "Varies by layer. IDE-native players differentiated on DX velocity. Background-agent players differentiated on long-horizon task capability. Both face Copilot.",
      durable_parts: [
        "Cross-IDE / cross-SCM neutrality (where it exists)",
        "Long-horizon task reliability for background agents",
        "Self-host posture for regulated buyers",
        "Developer-experience velocity"
      ],
      commoditizing_parts: [
        "Single-file completion",
        "Basic chat-in-IDE",
        "Simple test generation"
      ],
      absorbable_parts: [
        "Anything inside the GitHub envelope (Copilot will ship it)",
        "Single-vertical workflows that hyperscalers will replicate"
      ],
      survivability_moves: [
        "Own a developer base that is not GitHub-default (regulated, JetBrains-heavy, polyglot)",
        "Capture the long-horizon background-agent workflow with deep IDE integration",
        "Self-host posture for regulated enterprise",
        "Cross-model neutrality (Claude + OpenAI + open models)",
        "Outcome-based or seat-aligned pricing that survives Copilot bundling"
      ],
      confidence: "Medium. Copilot's distribution is the single biggest variable; many startups will be forced into specialization or acquisition outcomes."
    },
    reasoning: [
      {
        conclusion: "Copilot distribution is the dominant strategic gravity in the category.",
        signals: ["GitHub seat license footprint", "VS Code default IDE", "Azure + OpenAI integration"]
      },
      {
        conclusion: "Background-agent and IDE-native are different products with different moats.",
        signals: ["latency budgets differ", "buyer differs (developer vs platform eng)", "evaluation metric differs"]
      },
      {
        conclusion: "Cross-IDE / cross-SCM neutrality is a real but narrowing wedge.",
        signals: ["JetBrains developer base", "self-host buyers", "polyglot enterprises"]
      }
    ],
    risks: [
      { name: "Copilot bundling", detail: "Microsoft / GitHub continues to bundle adjacent capabilities at unmatched distribution." },
      { name: "Model commoditization", detail: "If frontier model gap narrows, product becomes the differentiator; if it widens, model-partner choice matters more." },
      { name: "OSS pressure", detail: "Aider, Sweep, OpenDevin pull pieces toward OSS defaults." },
      { name: "Hyperscaler bundling", detail: "Q Developer / Code Assist bundled into cloud spend." },
      { name: "Enterprise pricing pressure", detail: "Copilot Enterprise pricing sets the ceiling." }
    ],
    questions: [
      "What is the IDE distribution strategy — own a forked IDE, plugin to existing IDEs, or cloud dev environment?",
      "Is the product foreground (IDE-native) or background (autonomous agent)? Why not both — what was the strategic call?",
      "What is the model-partner strategy — single model, multi-model, or open models?",
      "What is the self-host posture for regulated buyers?",
      "How does the product behave when GitHub Copilot is already in the customer's stack?",
      "What is the SCM neutrality story — GitHub / GitLab / Bitbucket / self-hosted?",
      "What does the long-horizon task reliability look like — completion rate on real production tasks?",
      "How is pricing structured to survive Copilot bundling pressure?"
    ]
  },

  /* ============================================================
     DEFAULT FALLBACK — structured generic with input weaving
     ============================================================ */
  default: {
    label: "Generic enterprise AI",
    summary: "Category not detected from inputs. Reasoning below is more inference-heavy and explicitly marked.",
    product: {
      technical_layer: "Application layer building on foundation models, owning a workflow or data primitive specific to the customer's domain. [Inferred — refine with product docs.]",
      runtime_position: "Sits above the model provider and beneath the customer's system of record. Specific position depends on workflow ownership.",
      workflow_ownership: "Owns a discrete workflow that ends in a customer-relevant deliverable (decision, document, action). Decomposing this precisely is the first diligence question.",
      deployment_assumption: "Cloud SaaS by default; self-host tier required for regulated buyers.",
      likely_buyer: "Domain owner of the workflow (operations, engineering, legal, finance, etc.). Procurement increasingly co-owned with IT and security.",
      architectural_wedge: "Either workflow depth (vertical) or primitive depth (horizontal infrastructure). Diligence should clarify which.",
      ai_dependency: "Total or partial. Diligence should clarify whether AI is the wedge or an accelerant on a non-AI workflow.",
      stack_position: "Adjacent to the model provider, the data plane, and any incumbent platform serving the same workflow."
    },
    adjacencies: {
      incumbents: [
        { name: "Workflow incumbent #1", note: "Existing platform serving the same workflow. To identify in diligence." },
        { name: "Workflow incumbent #2", note: "Adjacent platform with bundle potential." },
        { name: "Hyperscaler bundle", note: "Microsoft / AWS / Google bundled equivalents." }
      ],
      startups: [
        { name: "Direct competitor #1", note: "Closest startup competitor — to identify." },
        { name: "Direct competitor #2", note: "Second closest — to identify." },
        { name: "Adjacent startup", note: "Different wedge, overlapping buyer." }
      ],
      platforms: [
        { name: "Model providers", note: "OpenAI, Anthropic, Google, Meta — pricing and capability move the substrate." },
        { name: "Hyperscaler agent runtimes", note: "Bedrock / Vertex / Azure AI Foundry — bundle pressure on adjacent primitives." }
      ]
    },
    incumbents: [
      {
        name: "[Incumbent to identify]",
        today: "[Their current product surface in the workflow.]",
        capable_of: "[What they could ship technically.]",
        likely_to: "[What ecosystem and architecture suggest they will actually ship.]",
        architecture_constraints: "[Where their existing data model or product surface limits them.]",
        ecosystem_incentives: "[Bundle dynamics, partner conflicts.]",
        distribution: "[Existing footprint in the buyer's environment.]"
      },
      {
        name: "Microsoft (likely candidate)",
        today: "Azure OpenAI, Copilot family, Microsoft Fabric data platform.",
        capable_of: "Bundle a vertical or horizontal AI product into existing seat licenses.",
        likely_to: "Ship 'good enough' bundled capability inside the Microsoft envelope; less compelling outside it.",
        architecture_constraints: "Microsoft 365 / Azure-centric; cross-cloud neutrality is anti-incentive.",
        ecosystem_incentives: "Drive Copilot, Azure, and seat consumption.",
        distribution: "Massive in enterprise IT."
      }
    ],
    startups: [
      {
        name: "[Direct competitor to identify]",
        wedge: "[Their wedge — to research.]",
        roadmap: "[Likely roadmap direction based on hiring and changelog.]",
        convergence_risk: "Unknown without further research.",
        role: "competitor"
      }
    ],
    vs_analysis: [
      {
        actor: "Microsoft / Hyperscaler",
        possible: "Bundle equivalent capability into existing platform SKUs.",
        likely: "Ship at distribution advantage but with shallower depth than specialist.",
        constraint: "Bundling depth-of-feature lags specialist by 12–24 months on average; specialist's window is finite."
      },
      {
        actor: "OpenAI / Anthropic",
        possible: "Ship adjacent product directly competing with partners.",
        likely: "Stay at model layer for now; ship lightweight product surfaces only.",
        constraint: "Channel conflict with API customers; sustained product investment competes with model R&D."
      }
    ],
    durability: {
      level: "low",
      differentiated_today: "Insufficient evidence in inputs to assess confidently. Provide product docs, integrations, customer evidence, and ecosystem context for a sharper read.",
      durable_parts: [
        "Workflow depth and customer-specific data primitive",
        "Compliance and self-host posture for regulated buyers",
        "Cross-vendor neutrality where credible"
      ],
      commoditizing_parts: [
        "Generic chat surfaces",
        "Basic retrieval and summarization",
        "Single-step LLM workflows"
      ],
      absorbable_parts: [
        "Anything a Copilot SKU will ship",
        "Single-vertical features inside one hyperscaler"
      ],
      survivability_moves: [
        "Own a workflow deeper than any bundled equivalent",
        "Capture the data primitive that incumbents cannot replicate without customer onboarding",
        "Build a regulated-buyer posture (self-host, audit, GRC integration)"
      ],
      confidence: "Low. Inputs too sparse to support confident assessment. This block should be regenerated after additional research."
    },
    reasoning: [
      {
        conclusion: "Category detection failed — output reasoning is generic and inference-heavy.",
        signals: ["no clear category keywords matched", "limited public-evidence input", "company-specific context not provided"]
      }
    ],
    risks: [
      { name: "Category ambiguity", detail: "Without a clearly defined category, every section is inference-heavy." },
      { name: "Hyperscaler bundling", detail: "Generic default risk in any AI-application category." },
      { name: "Foundation-model commoditization pressure", detail: "If model capability is the only wedge, commoditization is rapid." },
      { name: "Buyer ambiguity", detail: "Workflow owner unclear without diligence." }
    ],
    questions: [
      "What is the precise workflow the product owns end-to-end?",
      "Who is the buyer in the top 3 closed customers — function and seniority?",
      "What integrations exist today — and which are deep (data plane) vs shallow (one-shot API)?",
      "What is the customer's path when Microsoft / Google / AWS ships a bundled equivalent?",
      "What is the data primitive the product creates that incumbents cannot replicate?",
      "What is the GTM motion — bottom-up developer, top-down enterprise, or domain-specialist sales?",
      "What is the deployment posture — SaaS, self-host, hybrid?",
      "What is the model strategy — single model, multi-model, fine-tuned, or in-house?"
    ]
  }
};


/* ---------- 2. Category detection ------------------------- */

const CATEGORY_KEYWORDS = {
  agent_identity: [
    "agent identity", "agent auth", "agent authorization", "agent access",
    "auth for agents", "identity for agents", "scoped credentials",
    "agent delegation", "agent permissions", "agent oauth",
    "non-human identity", "machine identity for ai",
    "keycard", "anon.com", "auth for ai", "agent authn", "agent authz"
  ],
  agent_observability: [
    "observability", "tracing", "evals", "evaluation",
    "llm observability", "agent observability",
    "prompt management", "prompt tracing", "trace store",
    "langsmith", "langfuse", "helicone", "arize", "braintrust",
    "patronus", "humanloop", "galileo",
    "regression detection", "online eval", "offline eval"
  ],
  voice_agent: [
    "voice agent", "voice ai", "asr", "tts",
    "speech-to-text", "text-to-speech", "speech to speech",
    "telephony", "contact center", "ccaas",
    "twilio", "vapi", "retell", "bland", "elevenlabs",
    "deepgram", "assemblyai", "ivr", "inbound calls", "outbound calls"
  ],
  code_ai: [
    "code completion", "code agent", "swe agent",
    "ide", "developer tool", "code review ai",
    "copilot", "cursor", "codeium", "windsurf",
    "devin", "cognition", "aider", "sweep",
    "background agent for code", "ai pair programmer", "autonomous swe"
  ]
};

function detectCategory(company, website, notes) {
  const haystack = ((company || "") + " " + (website || "") + " " + (notes || "")).toLowerCase();
  let bestCat = "default";
  let bestScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) {
      if (haystack.includes(kw)) score += (kw.length > 12 ? 2 : 1);
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }
  return { category: bestCat, score: bestScore };
}

function extractSignals(notes) {
  if (!notes || !notes.trim()) return [];
  const signals = [];
  const text = notes.toLowerCase();
  const buckets = [
    { tag: "integrations", terms: ["integration", "integrate", "sdk", "api", "webhook"] },
    { tag: "architecture", terms: ["architecture", "runtime", "gateway", "proxy", "middleware"] },
    { tag: "customers", terms: ["customer", "case study", "fortune", "enterprise"] },
    { tag: "hiring", terms: ["hiring", "job posting", "linkedin", "recruiter"] },
    { tag: "pricing", terms: ["pricing", "outcome-based", "seat", "consumption"] },
    { tag: "open-source", terms: ["open source", "oss", "github", "mit license", "apache"] },
    { tag: "regulated", terms: ["soc2", "hipaa", "fedramp", "regulated", "compliance"] },
    { tag: "model-partner", terms: ["openai", "anthropic", "claude", "gemini", "llama"] }
  ];
  for (const b of buckets) {
    if (b.terms.some(t => text.includes(t))) signals.push(b.tag);
  }
  return signals;
}


/* ---------- 3. Analysis composition ----------------------- */

function composeAnalysis({ company, website, notes, mode }) {
  const detected = detectCategory(company, website, notes);
  const profile = PROFILES[detected.category] || PROFILES.default;
  const signals = extractSignals(notes);
  const nameDisplay = company.trim() || "Untitled target";

  const evidence = composeEvidence({ notes, signals, detected, profile });
  const changes = composeChangeConditions(profile);

  return {
    id: cryptoId(),
    company: nameDisplay,
    website: website.trim(),
    notes: notes.trim(),
    mode,
    category: detected.category,
    categoryLabel: profile.label,
    categoryScore: detected.score,
    signals,
    generated_at: new Date().toISOString(),
    profile: deepInterpolate(profile, { company: nameDisplay }),
    evidence,
    changes
  };
}

function composeEvidence({ notes, signals, detected, profile }) {
  const rows = [];

  rows.push({
    claim: `Category classified as "${profile.label}"`,
    level: detected.score >= 4 ? "medium" : (detected.score >= 1 ? "weak" : "needs"),
    label: detected.score >= 4 ? "inferred" : (detected.score >= 1 ? "weak-support" : "open")
  });

  if (notes && notes.trim().length > 200) {
    rows.push({
      claim: "Reasoning grounded in user-provided research notes",
      level: "medium",
      label: "inferred"
    });
  } else {
    rows.push({
      claim: "Reasoning relies on category templates; minimal company-specific evidence in inputs",
      level: "weak",
      label: "weak-support"
    });
  }

  if (signals.includes("integrations")) {
    rows.push({ claim: "Integration / SDK references present in notes", level: "medium", label: "inferred" });
  }
  if (signals.includes("architecture")) {
    rows.push({ claim: "Architecture-level references present in notes", level: "medium", label: "inferred" });
  }
  if (signals.includes("customers")) {
    rows.push({ claim: "Customer evidence referenced in notes", level: "medium", label: "inferred" });
  }
  if (signals.includes("hiring")) {
    rows.push({ claim: "Hiring signals referenced in notes", level: "weak", label: "weak-support" });
  }
  if (signals.includes("regulated")) {
    rows.push({ claim: "Compliance / regulated-buyer signals in notes", level: "medium", label: "inferred" });
  }
  if (signals.includes("open-source")) {
    rows.push({ claim: "Open-source posture referenced in notes", level: "medium", label: "inferred" });
  }
  if (signals.includes("model-partner")) {
    rows.push({ claim: "Model-partner relationships referenced in notes", level: "weak", label: "weak-support" });
  }

  rows.push({
    claim: "Strategic conclusions on incumbent / startup roadmap likelihood",
    level: "weak",
    label: "inferred"
  });
  rows.push({
    claim: "No live web retrieval performed in this prototype",
    level: "weak",
    label: "open"
  });

  return rows;
}

function composeChangeConditions(profile) {
  return [
    {
      thesis: "Differentiation is durable as ecosystems converge.",
      strengthen: "Customer evidence of depth (audit, workflow ownership, data primitive) that incumbents have not replicated 18+ months after launch.",
      weaken: "Hyperscaler or framework ships a bundled equivalent that is 70% of the product at 30% of the procurement friction.",
      invalidate: "Major framework or hyperscaler ships a free or near-free primitive that is structurally equivalent at the data-model level."
    },
    {
      thesis: "Buyer is well-defined and the procurement motion is repeatable.",
      strengthen: "Top 10 closed customers share the same functional buyer and similar deal cycle.",
      weaken: "Deal cycles vary 5x and buyer functions vary across deals; each sale is bespoke.",
      invalidate: "No clear pattern emerges across 20+ closed customers; category remains pre-paradigmatic."
    },
    {
      thesis: profile.label + " category has durable economic value.",
      strengthen: "Foundation-model price-performance gains accrue to the category's value capture (i.e. cheaper models drive more usage of the product).",
      weaken: "Cheaper / better models cannibalize the product's specific reasoning step.",
      invalidate: "A new model release subsumes the product's core capability inside a single API call."
    }
  ];
}

function deepInterpolate(obj, vars) {
  if (obj == null) return obj;
  if (typeof obj === "string") {
    return obj.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] != null ? vars[k] : "{{" + k + "}}");
  }
  if (Array.isArray(obj)) return obj.map(x => deepInterpolate(x, vars));
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepInterpolate(v, vars);
    return out;
  }
  return obj;
}

function cryptoId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}


/* ---------- 4. Rendering ---------------------------------- */

function renderAnalysis(a) {
  document.getElementById("empty-state").hidden = true;
  document.getElementById("analysis").hidden = false;

  document.getElementById("out-company-name").textContent = a.company;
  const metaEl = document.getElementById("out-meta");
  metaEl.innerHTML = "";
  metaEl.append(
    spanEl(a.website || "no website provided"),
    spanEl("Category: " + a.categoryLabel),
    spanEl("Mode: " + (a.mode === "manual" ? "Manual" : "Hybrid")),
    spanEl("Generated: " + formatTimestamp(a.generated_at))
  );

  const warningHTML = a.category === "default"
    ? `<div class="warn-banner"><strong>Limited evidence.</strong> Category not detected from inputs. Reasoning below is generic and inference-heavy. Paste richer research (developer docs, integrations, customer notes) and re-generate for a sharper read.</div>`
    : `<div class="warn-banner"><strong>Evidence posture.</strong> No live web retrieval performed. Reasoning is grounded in category-template structure and user-provided notes. Each section is explicitly labeled. Treat as a directional diligence skeleton, not a final memo.</div>`;

  renderProduct(a, warningHTML);
  renderAdjacencies(a);
  renderIncumbents(a);
  renderStartups(a);
  renderVs(a);
  renderDurability(a);
  renderReasoning(a);
  renderEvidence(a);
  renderChange(a);
  renderRisks(a);
  renderQuestions(a);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function spanEl(text) { const s = document.createElement("span"); s.textContent = text; return s; }
function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderProduct(a, warningHTML) {
  const p = a.profile.product;
  const fields = [
    ["Technical layer", p.technical_layer],
    ["Runtime position", p.runtime_position],
    ["Workflow ownership", p.workflow_ownership],
    ["Deployment", p.deployment_assumption],
    ["Likely buyer", p.likely_buyer],
    ["Architectural wedge", p.architectural_wedge],
    ["AI dependency", p.ai_dependency],
    ["Stack position", p.stack_position]
  ];
  const dl = fields.map(([k, v]) => `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd>`).join("");
  document.getElementById("out-product").innerHTML = `
    ${warningHTML}
    <div class="subcard">
      <div class="subcard-title">${escapeHTML(a.company)} <span class="badge inferred">Inferred</span></div>
      <div class="subcard-sub">Architecture-aware decomposition. Not a summary of marketing copy.</div>
      <dl>${dl}</dl>
    </div>
  `;
}

function renderAdjacencies(a) {
  const adj = a.profile.adjacencies;
  const block = (title, items) => `
    <div class="subcard">
      <div class="subcard-title">${escapeHTML(title)}</div>
      <ul>${items.map(i => `<li><strong>${escapeHTML(i.name)}</strong> &mdash; <span class="muted">${escapeHTML(i.note)}</span></li>`).join("")}</ul>
    </div>
  `;
  document.getElementById("out-adjacencies").innerHTML =
    block("Incumbents with convergence pressure", adj.incumbents) +
    block("Adjacent startups", adj.startups) +
    block("Platform / runtime adjacencies", adj.platforms);
}

function renderIncumbents(a) {
  const items = a.profile.incumbents;
  const html = items.map(i => `
    <div class="subcard">
      <div class="subcard-title">${escapeHTML(i.name)} <span class="badge inferred">Inferred</span></div>
      <dl>
        <dt>Today</dt><dd>${escapeHTML(i.today)}</dd>
        <dt>Technically capable of</dt><dd>${escapeHTML(i.capable_of)}</dd>
        <dt>Strategically likely to</dt><dd>${escapeHTML(i.likely_to)}</dd>
        <dt>Architecture constraints</dt><dd>${escapeHTML(i.architecture_constraints)}</dd>
        <dt>Ecosystem incentives</dt><dd>${escapeHTML(i.ecosystem_incentives)}</dd>
        <dt>Distribution</dt><dd>${escapeHTML(i.distribution)}</dd>
      </dl>
    </div>
  `).join("");
  document.getElementById("out-incumbents").innerHTML = html;
}

function renderStartups(a) {
  const items = a.profile.startups;
  const html = items.map(s => `
    <div class="subcard">
      <div class="subcard-title">${escapeHTML(s.name)} <span class="badge ${s.role}">${escapeHTML(roleLabel(s.role))}</span></div>
      <dl>
        <dt>Current wedge</dt><dd>${escapeHTML(s.wedge)}</dd>
        <dt>Likely roadmap</dt><dd>${escapeHTML(s.roadmap)}</dd>
        <dt>Convergence risk</dt><dd>${escapeHTML(s.convergence_risk)}</dd>
      </dl>
    </div>
  `).join("");
  document.getElementById("out-startups").innerHTML = html;
}
function roleLabel(role) {
  return role === "competitor" ? "Competitor" : (role === "complement" ? "Complement" : "Acquisition target");
}

function renderVs(a) {
  const items = a.profile.vs_analysis;
  const html = items.map(v => `
    <div class="vs-row">
      <div class="vs-col possible">
        <h4>Technically possible</h4>
        <div class="actor">${escapeHTML(v.actor)}</div>
        <p>${escapeHTML(v.possible)}</p>
      </div>
      <div class="vs-col likely">
        <h4>Strategically likely</h4>
        <div class="actor">${escapeHTML(v.actor)}</div>
        <p>${escapeHTML(v.likely)}</p>
      </div>
    </div>
    <div class="vs-constraint">${escapeHTML(v.constraint)}</div>
  `).join("");
  document.getElementById("out-vs").innerHTML = html;
}

function renderDurability(a) {
  const d = a.profile.durability;
  const level = (d.level || "low").toLowerCase();
  const bars = [1, 2, 3].map(i => {
    const filled = (level === "high" && i <= 3) || (level === "medium" && i <= 2) || (level === "low" && i <= 1);
    return `<div class="dur-bar ${filled ? "on " + level : ""}"></div>`;
  }).join("");
  const meter = `
    <div class="dur-meter">
      <div class="dur-label">Durability</div>
      <div class="dur-level ${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</div>
      <div class="dur-bars">${bars}</div>
      <div class="dur-confidence">Confidence: ${escapeHTML(d.confidence.split(".")[0])}</div>
    </div>
  `;
  const list = (arr) => `<ul>${arr.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>`;
  const detail = `
    <div class="dur-detail">
      <h4>Differentiated today</h4>
      <p>${escapeHTML(d.differentiated_today)}</p>
      <h4>Durable parts</h4>${list(d.durable_parts)}
      <h4>Likely to commoditize</h4>${list(d.commoditizing_parts)}
      <h4>Likely to be absorbed</h4>${list(d.absorbable_parts)}
      <h4>Survivability moves</h4>${list(d.survivability_moves)}
      <h4>Confidence</h4>
      <p>${escapeHTML(d.confidence)}</p>
    </div>
  `;
  document.getElementById("out-durability").innerHTML = `<div class="durability">${meter}${detail}</div>`;
}

function renderReasoning(a) {
  const items = a.profile.reasoning;
  const html = items.map(r => `
    <div class="reason-row">
      <div class="reason-conclusion">${escapeHTML(r.conclusion)}</div>
      <div class="reason-signals">${r.signals.map(s => `<span class="pill">${escapeHTML(s)}</span>`).join("")}</div>
    </div>
  `).join("");
  document.getElementById("out-reasoning").innerHTML = html;
}

function renderEvidence(a) {
  const rows = a.evidence;
  const header = `
    <div class="e-head">Claim / source</div>
    <div class="e-head">Strength</div>
    <div class="e-head">Label</div>
  `;
  const body = rows.map(r => `
    <div>${escapeHTML(r.claim)}</div>
    <div><span class="badge ${r.level}">${strengthLabel(r.level)}</span></div>
    <div><span class="badge ${r.label}">${labelLabel(r.label)}</span></div>
  `).join("");
  document.getElementById("out-evidence").innerHTML = `<div class="evidence-grid">${header}${body}</div>`;
}
function strengthLabel(l) {
  return ({ strong: "Strong", medium: "Medium", weak: "Weak", needs: "Needs validation" })[l] || l;
}
function labelLabel(l) {
  return ({ verified: "Verified", inferred: "Inferred", "weak-support": "Weakly supported", open: "Open question" })[l] || l;
}

function renderChange(a) {
  const html = a.changes.map(c => `
    <div class="change-row">
      <div class="change-thesis">${escapeHTML(c.thesis)}</div>
      <div class="change-grid">
        <div class="change-cell strengthen"><h5>Strengthens</h5><p>${escapeHTML(c.strengthen)}</p></div>
        <div class="change-cell weaken"><h5>Weakens</h5><p>${escapeHTML(c.weaken)}</p></div>
        <div class="change-cell invalidate"><h5>Invalidates</h5><p>${escapeHTML(c.invalidate)}</p></div>
      </div>
    </div>
  `).join("");
  document.getElementById("out-change").innerHTML = html;
}

function renderRisks(a) {
  const items = a.profile.risks;
  const html = `<ul class="risks-list">${items.map(r => `
    <li>
      <div class="risk-name">${escapeHTML(r.name)}</div>
      <div class="risk-detail">${escapeHTML(r.detail)}</div>
    </li>
  `).join("")}</ul>`;
  document.getElementById("out-risks").innerHTML = html;
}

function renderQuestions(a) {
  const items = a.profile.questions;
  document.getElementById("out-questions").innerHTML =
    `<ol class="q-list">${items.map(q => `<li>${escapeHTML(q)}</li>`).join("")}</ol>`;
}

function escapeHTML(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/* ---------- 5. localStorage ------------------------------- */

const STORAGE_KEY = "dre.saved.v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function persistSaved(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function saveCurrent() {
  if (!state.current) return;
  const existing = state.saved.findIndex(s => s.id === state.current.id);
  if (existing >= 0) {
    state.saved[existing] = state.current;
  } else {
    state.saved.unshift(state.current);
  }
  persistSaved(state.saved);
  renderSavedList();
  flashGenMeta("Saved.");
}

function deleteSaved(id) {
  state.saved = state.saved.filter(s => s.id !== id);
  persistSaved(state.saved);
  renderSavedList();
}

function renderSavedList() {
  const el = document.getElementById("saved-list");
  document.getElementById("saved-count").textContent = state.saved.length;
  if (!state.saved.length) {
    el.innerHTML = `<div class="empty">No saved insights yet.</div>`;
    return;
  }
  el.innerHTML = state.saved.map(s => `
    <div class="saved-item">
      <div class="saved-item-main" data-id="${s.id}">
        <div class="saved-item-name">${escapeHTML(s.company)}</div>
        <div class="saved-item-meta">${escapeHTML(s.categoryLabel)} &middot; ${escapeHTML(formatTimestamp(s.generated_at))}</div>
      </div>
      <button class="saved-item-del" data-del="${s.id}" title="Delete">&times;</button>
    </div>
  `).join("");
  el.querySelectorAll(".saved-item-main").forEach(el2 => {
    el2.addEventListener("click", () => {
      const id = el2.getAttribute("data-id");
      const found = state.saved.find(s => s.id === id);
      if (found) {
        state.current = found;
        document.getElementById("in-company").value = found.company;
        document.getElementById("in-website").value = found.website || "";
        document.getElementById("in-notes").value = found.notes || "";
        renderAnalysis(found);
        flashGenMeta("Reloaded saved insight.");
      }
    });
  });
  el.querySelectorAll(".saved-item-del").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      deleteSaved(btn.getAttribute("data-del"));
    });
  });
}


/* ---------- 6. Export ------------------------------------- */

function exportMemo(a) {
  const lines = [];
  const heading = (t) => lines.push("", "## " + t, "");
  const sub = (t) => lines.push("", "### " + t);
  const item = (k, v) => lines.push("- **" + k + ":** " + v);

  lines.push("# " + a.company + " — Differentiation Analysis");
  lines.push("");
  lines.push("*Category: " + a.categoryLabel + "*  ");
  lines.push("*Generated: " + formatTimestamp(a.generated_at) + "*  ");
  lines.push("*Mode: " + (a.mode === "manual" ? "Manual" : "Hybrid") + "*  ");
  if (a.website) lines.push("*Website: " + a.website + "*  ");
  lines.push("");
  lines.push("> Reasoning skeleton produced by the Differentiation Reasoning Engine. No live web retrieval performed; conclusions are explicitly marked as Inferred / Weakly Supported / Open Question.");

  heading("01 Semi-Technical Product Decomposition");
  const p = a.profile.product;
  item("Technical layer", p.technical_layer);
  item("Runtime position", p.runtime_position);
  item("Workflow ownership", p.workflow_ownership);
  item("Deployment", p.deployment_assumption);
  item("Likely buyer", p.likely_buyer);
  item("Architectural wedge", p.architectural_wedge);
  item("AI dependency", p.ai_dependency);
  item("Stack position", p.stack_position);

  heading("02 Strategic Adjacencies");
  sub("Incumbents with convergence pressure");
  a.profile.adjacencies.incumbents.forEach(i => lines.push("- **" + i.name + "** — " + i.note));
  sub("Adjacent startups");
  a.profile.adjacencies.startups.forEach(i => lines.push("- **" + i.name + "** — " + i.note));
  sub("Platform / runtime adjacencies");
  a.profile.adjacencies.platforms.forEach(i => lines.push("- **" + i.name + "** — " + i.note));

  heading("03 Incumbent Expansion Analysis");
  a.profile.incumbents.forEach(i => {
    sub(i.name);
    item("Today", i.today);
    item("Technically capable of", i.capable_of);
    item("Strategically likely to", i.likely_to);
    item("Architecture constraints", i.architecture_constraints);
    item("Ecosystem incentives", i.ecosystem_incentives);
    item("Distribution", i.distribution);
  });

  heading("04 Startup Expansion Analysis");
  a.profile.startups.forEach(s => {
    sub(s.name + " — " + roleLabel(s.role));
    item("Wedge", s.wedge);
    item("Likely roadmap", s.roadmap);
    item("Convergence risk", s.convergence_risk);
  });

  heading("05 Technically Possible vs Strategically Likely");
  a.profile.vs_analysis.forEach(v => {
    sub(v.actor);
    item("Technically possible", v.possible);
    item("Strategically likely", v.likely);
    item("Constraint", v.constraint);
  });

  heading("06 Differentiation Durability");
  const d = a.profile.durability;
  lines.push("**Level: " + d.level.toUpperCase() + "**");
  lines.push("");
  lines.push(d.differentiated_today);
  sub("Durable parts");
  d.durable_parts.forEach(x => lines.push("- " + x));
  sub("Commoditizing parts");
  d.commoditizing_parts.forEach(x => lines.push("- " + x));
  sub("Absorbable parts");
  d.absorbable_parts.forEach(x => lines.push("- " + x));
  sub("Survivability moves");
  d.survivability_moves.forEach(x => lines.push("- " + x));
  lines.push("");
  lines.push("**Confidence:** " + d.confidence);

  heading("07 Reasoning Signals");
  a.profile.reasoning.forEach(r => {
    lines.push("- **" + r.conclusion + "**");
    lines.push("  - Signals: " + r.signals.join(", "));
  });

  heading("08 Evidence Strength");
  a.evidence.forEach(e => {
    lines.push("- " + e.claim + "  *(" + strengthLabel(e.level) + " / " + labelLabel(e.label) + ")*");
  });

  heading("09 What Would Change This Conclusion?");
  a.changes.forEach(c => {
    sub(c.thesis);
    item("Strengthens", c.strengthen);
    item("Weakens", c.weaken);
    item("Invalidates", c.invalidate);
  });

  heading("10 Strategic Risks");
  a.profile.risks.forEach(r => {
    lines.push("- **" + r.name + ":** " + r.detail);
  });

  heading("11 Open Diligence Questions");
  a.profile.questions.forEach((q, idx) => lines.push((idx + 1) + ". " + q));

  if (a.notes && a.notes.trim().length) {
    heading("Appendix — User-Provided Research Notes");
    lines.push("```");
    lines.push(a.notes);
    lines.push("```");
  }

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = (a.company || "memo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  link.href = url;
  link.download = slug + "-differentiation-memo.md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  flashGenMeta("Exported memo.");
}


/* ---------- 7. UI plumbing -------------------------------- */

const state = {
  current: null,
  saved: [],
  mode: "hybrid"
};

function flashGenMeta(msg) {
  const el = document.getElementById("gen-meta");
  el.textContent = msg;
  clearTimeout(flashGenMeta._t);
  flashGenMeta._t = setTimeout(() => { el.textContent = ""; }, 2400);
}

function generate() {
  const company = document.getElementById("in-company").value;
  const website = document.getElementById("in-website").value;
  const notes = document.getElementById("in-notes").value;
  if (!company.trim()) {
    flashGenMeta("Enter a company name.");
    return;
  }
  const a = composeAnalysis({ company, website, notes, mode: state.mode });
  state.current = a;
  renderAnalysis(a);
  flashGenMeta("Analysis generated — category: " + a.categoryLabel + ".");
}

function clearInputs() {
  document.getElementById("in-company").value = "";
  document.getElementById("in-website").value = "";
  document.getElementById("in-notes").value = "";
  flashGenMeta("Cleared.");
}

function loadDemo(kind) {
  const demos = {
    "agent-identity": {
      company: "Keycard",
      website: "keycard.ai",
      notes: `Category: agent identity / agent authorization.
Working hypothesis: per-agent identity, scoped tokens, and decision-level audit for AI agents acting on behalf of users.
Likely surfaces: SDK + self-hostable gateway. OAuth-shaped but agent-native primitives.
Adjacent: Okta non-human identity, WorkOS Auth for AI, Anon browser session capture, Permit.io / Cerbos authz, LangChain runtime, MCP protocol.
Buyer hypothesis: dual-buyer between platform engineering and CISO.
Open: integration depth, audit granularity, MCP stance, customer evidence for regulated buyers.`
    },
    "agent-observability": {
      company: "Example LLM Observability Co",
      website: "",
      notes: `Category: agent observability, evals, tracing.
SDK instrumentation + cloud store + UI for traces and evals.
Adjacent: LangSmith (LangChain), Langfuse OSS, Helicone, Arize Phoenix, Braintrust evals-first, Patronus / Galileo, Datadog LLM Observability, OpenTelemetry GenAI conventions.
Open: release-gate adoption, framework neutrality, eval primitive depth.`
    }
  };
  const d = demos[kind];
  if (!d) return;
  document.getElementById("in-company").value = d.company;
  document.getElementById("in-website").value = d.website;
  document.getElementById("in-notes").value = d.notes;
  flashGenMeta("Demo loaded. Click Generate Analysis.");
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".seg-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-mode") === mode);
  });
  const note = document.getElementById("mode-note");
  if (mode === "manual") {
    note.innerHTML = "Manual: the engine reasons over the pasted research only. No external retrieval is attempted.";
  } else {
    note.innerHTML = "Hybrid: combine lightweight public signals (if available) with any pasted research. The engine reasons over inputs &mdash; it does not fabricate sources.";
  }
}

function openModal() {
  document.getElementById("workflow-modal").hidden = false;
}
function closeModal() {
  document.getElementById("workflow-modal").hidden = true;
}


/* ---------- 8. Init --------------------------------------- */

function init() {
  state.saved = loadSaved();
  renderSavedList();

  document.getElementById("btn-generate").addEventListener("click", generate);
  document.getElementById("btn-clear").addEventListener("click", clearInputs);
  document.getElementById("btn-save").addEventListener("click", saveCurrent);
  document.getElementById("btn-export").addEventListener("click", () => {
    if (state.current) exportMemo(state.current);
  });

  document.querySelectorAll(".seg-btn").forEach(b => {
    b.addEventListener("click", () => setMode(b.getAttribute("data-mode")));
  });

  document.querySelectorAll(".link-btn[data-demo]").forEach(b => {
    b.addEventListener("click", () => loadDemo(b.getAttribute("data-demo")));
  });

  document.getElementById("btn-show-saved").addEventListener("click", () => {
    document.querySelector(".input-panel").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("btn-show-workflow").addEventListener("click", openModal);
  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));

  document.getElementById("in-company").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });
  document.getElementById("in-website").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });
}

document.addEventListener("DOMContentLoaded", init);
