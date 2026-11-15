const http = require("http");
const PORT = process.env.PORT || 8787;

function abs(base, rel) {
  try { return new URL(rel, base).href; } catch (e) { return rel; }
}

function rewriteM3U8(text, base, self) {
  return text.split(/\r?\n/).map(function (line) {
    const t = line.trim();
    if (!t) return line;
    if (t.startsWith("#")) {
      return line.replace(/URI="([^"]+)"/g, function (m, u) {
        return 'URI="' + self + encodeURIComponent(abs(base, u)) + '"';
      });
    }
    return self + encodeURIComponent(abs(base, t));
  }).join("\n");
}

http.createServer(async (req, res) => {
  const h = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
  if (req.method === "OPTIONS") { res.writeHead(204, h); return res.end(); }

  const target = new URL(req.url, "http://x").searchParams.get("url");
  if (!target || !/^https?:\/\//i.test(target)) { res.writeHead(400, h); return res.end("url?"); }

  const self = (req.headers["x-forwarded-proto"] || "http") + "://" + req.headers.host + "/?url=";
  const ac = new AbortController();
  res.on("close", () => ac.abort());

  try {
    const r = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "*/*" },
      redirect: "follow",
      signal: ac.signal
    });
    const ct = r.headers.get("content-type") || "";
    const isM3U = /mpegurl/i.test(ct) || /\.m3u8(\?|$)/i.test(target);

    if (isM3U) {
      const body = rewriteM3U8(await r.text(), r.url || target, self);
      res.writeHead(r.status, Object.assign({}, h, { "Content-Type": "application/vnd.apple.mpegurl" }));
      return res.end(body);
    }

    res.writeHead(r.status, Object.assign({}, h, { "Content-Type": ct || "application/octet-stream" }));
    const reader = r.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(value)) await new Promise((ok) => res.once("drain", ok));
    }
    res.end();
  } catch (e) {
    if (!res.headersSent) res.writeHead(502, h);
    res.end("xeta: " + e.message);
  }
}).listen(PORT, () => console.log("proxy :" + PORT));