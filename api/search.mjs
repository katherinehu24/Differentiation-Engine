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

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "TAVILY_API_KEY not configured",
      hint: "Add it in Vercel → Project → Settings → Environment Variables, then redeploy."
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
