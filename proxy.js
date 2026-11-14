// Cloudflare Worker CORS proxy for the TV page.
// Usage from the page: https://YOUR-WORKER.workers.dev/?url=<encoded stream url>
export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "*"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const target = new URL(request.url).searchParams.get("url");
    if (!target || !/^https?:\/\//i.test(target)) {
      return new Response("missing or invalid url", { status: 400, headers: cors });
    }
    try {
      const h = new Headers();
      const range = request.headers.get("Range");
      if (range) h.set("Range", range);
      h.set("User-Agent", "Mozilla/5.0");
      const r = await fetch(target, { headers: h, redirect: "follow" });
      const out = new Headers(r.headers);
      Object.entries(cors).forEach(([k, v]) => out.set(k, v));
      out.set("Cache-Control", /\.m3u8/i.test(target) ? "no-store" : "public, max-age=30");
      return new Response(r.body, { status: r.status, headers: out });
    } catch (e) {
      return new Response("fetch failed", { status: 502, headers: cors });
    }
  }
};
