/*
    Cloudflare Worker - HLS proxy
    İstifadə: https://SIZIN-WORKER.workers.dev/?url=<kodlanmış ünvan>

    - http yayımları https üzərindən verir (mixed content həlli)
    - CORS başlıqları əlavə edir
    - m3u8 daxilindəki bütün linkləri yenidən proxy-yə yönləndirir
*/

// Yalnız bu saytlar proxy-dən istifadə edə bilər (öz GitHub Pages ünvanını yaz).
// Boş siyahı = hamıya açıq (tövsiyə olunmur).
const ALLOWED_ORIGINS = [
    // "https://SIZIN-AD.github.io",
    // "http://127.0.0.1:5500"
];

function corsHeaders(origin) {
    const allowed =
        ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
            ? (origin || "*")
            : "null";

    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
        "Vary": "Origin"
    };
}

export default {
    async fetch(request) {
        const origin = request.headers.get("Origin") || "";
        const cors = corsHeaders(origin);

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: cors });
        }

        if (ALLOWED_ORIGINS.length && origin && !ALLOWED_ORIGINS.includes(origin)) {
            return new Response("Forbidden", { status: 403, headers: cors });
        }

        const self = new URL(request.url);
        const target = self.searchParams.get("url");

        if (!target || !/^https?:\/\//i.test(target)) {
            return new Response("Missing or invalid ?url=", { status: 400, headers: cors });
        }

        let upstream;

        try {
            upstream = await fetch(target, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
                },
                redirect: "follow"
            });
        } catch (err) {
            return new Response("Upstream fetch failed", { status: 502, headers: cors });
        }

        if (!upstream.ok) {
            return new Response("Upstream error " + upstream.status, {
                status: upstream.status,
                headers: cors
            });
        }

        const finalUrl = upstream.url || target;
        const contentType = upstream.headers.get("Content-Type") || "";

        const looksLikePlaylist =
            /\.m3u8(\?|$)/i.test(finalUrl) ||
            /mpegurl/i.test(contentType);

        // Video seqmentləri: olduğu kimi ötür
        if (!looksLikePlaylist) {
            const headers = new Headers(cors);

            if (contentType) headers.set("Content-Type", contentType);
            headers.set("Cache-Control", "no-store");

            return new Response(upstream.body, { status: 200, headers });
        }

        // Playlist: linkləri yenidən yaz
        const text = await upstream.text();
        const proxyBase = self.origin + "/?url=";

        const wrap = link =>
            proxyBase + encodeURIComponent(new URL(link, finalUrl).href);

        const rewritten = text
            .split(/\r?\n/)
            .map(line => {
                const trimmed = line.trim();

                if (!trimmed) return line;

                // Tag-lar: URI="..." atributlarını çevir (şifrələmə açarı, init segment və s.)
                if (trimmed.startsWith("#")) {
                    return line.replace(/URI="([^"]+)"/g, (m, uri) => `URI="${wrap(uri)}"`);
                }

                // Adi sətir = alt-playlist və ya seqment
                return wrap(trimmed);
            })
            .join("\n");

        const headers = new Headers(cors);
        headers.set("Content-Type", "application/vnd.apple.mpegurl");
        headers.set("Cache-Control", "no-store");

        return new Response(rewritten, { status: 200, headers });
    }
};