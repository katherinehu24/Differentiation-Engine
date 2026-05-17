// Vercel serverless function — wraps Tavily Search API.
// Reads TAVILY_API_KEY from Vercel environment variables.
// Free tier: 1,000 searches/month, no credit card required at signup.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const query = ((body && body.query) || "").toString().trim();
  if (!query) return res.status(400).json({ error: "missing query" });

  // Debug endpoint — call with {"query":"__debug"} to inspect what the
  // function actually sees at runtime. Never returns the value of any secret.
  if (query === "__debug") {
    const tavilyKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes("tavily"));
    return res.status(200).json({
      debug: true,
      hasTavilyKey: !!process.env.TAVILY_API_KEY,
      tavilyKeyLength: (process.env.TAVILY_API_KEY || "").length,
      envKeysContainingTavily: tavilyKeys,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
      nodeVersion: process.version
    });
  }

  // Accept any of the common name variants so a Vercel env-var naming
  // mismatch doesn't silently break the integration.
  const apiKey = process.env.TAVILY_API_KEY
              || process.env.Tavily
              || process.env.TAVILY
              || process.env.TAVILY_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Tavily API key not configured",
      hint: "Add it in Vercel → Project → Settings → Environment Variables (any of TAVILY_API_KEY, Tavily, TAVILY, or TAVILY_KEY), then redeploy. Call with {\"query\":\"__debug\"} to inspect env state."
    });
  }

  try {
    const upstream = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false
      })
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(502).json({ error: "tavily upstream error", status: upstream.status, detail: text.slice(0, 500) });
    }

    const data = await upstream.json();
    return res.status(200).json({
      query,
      mode: "live",
      results: (data.results || []).map(r => ({
        title: r.title || "",
        url: r.url || "",
        snippet: (r.content || "").slice(0, 320)
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
