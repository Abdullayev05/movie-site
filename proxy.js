export default {
  async fetch(request) {
    const target = new URL(request.url).searchParams.get("url");
    if (!target) return new Response("url yoxdur", { status: 400 });
    const r = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "*/*" }
    });
    const h = new Headers(r.headers);
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Headers", "*");
    return new Response(r.body, { status: r.status, headers: h });
  }
};