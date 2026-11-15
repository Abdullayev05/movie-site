export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const target = new URL(request.url).searchParams.get("url");

    if (!target) {
      return new Response("url yoxdur", { status: 400, headers: cors });
    }

    const r = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const h = new Headers(r.headers);
    Object.entries(cors).forEach(([k, v]) => h.set(k, v));

    return new Response(r.body, { status: r.status, headers: h });
  }
};