(() => {
  "use strict";

  /* ================= SETTINGS ================= */
  const PROXY = "";
  const PUBLIC_PROXIES = ["https://corsproxy.io/?url=", "https://api.allorigins.win/raw?url="];
  const BASE = "https://iptv-org.github.io/iptv/countries/";
  const SOURCES = [
    { url: BASE + "ru.m3u", country: "ru" },
    { url: BASE + "by.m3u", country: "by" },
    { url: BASE + "ua.m3u", country: "ua" },
    { url: BASE + "az.m3u", country: "az" },
    { url: "https://raw.githubusercontent.com/TeleKinozal/iptv/main/tv.m3u", country: "ru" },
    { url: "https://raw.githubusercontent.com/Lemeri02/iptv/main/tv.m3u", country: "ru" },
    { url: "https://raw.githubusercontent.com/slava-67/TV/refs/heads/IPTV/iptv.m3u", country: "ru" },
    { url: "https://gist.githubusercontent.com/nurlan135/2abf1b34706f1fe6786c230652c808a0/raw/az.m3u", country: "az" },
    { url: "https://gist.githubusercontent.com/nurlan135/2abf1b34706f1fe6786c230652c808a0/raw/futbol.m3u", country: "ru" },
    { url: "https://gist.githubusercontent.com/nurlan135/2abf1b34706f1fe6786c230652c808a0/raw/tr.m3u", country: "tr" }
  ];
  const COUNTRY = { ru: "Rusiya", by: "Belarus", ua: "Ukrayna", az: "Azərbaycan", tr: "Türkiyə" };

  const LOGO_GOLD = "data:image/png;base64,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";
  const LOGO_MOS = "data:image/jpeg;base64,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";
  const MOSFILM = [
    { name: "Мосфильм", country: "ru", category: "movie", logo: LOGO_MOS, pinned: true,
      urls: ["https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv"] },
    { name: "Мосфильм. Золотая коллекция", country: "ru", category: "movie", logo: LOGO_GOLD, pinned: true,
      urls: ["http://31.222.235.15/mosfilm/index.m3u8"] },
    { name: "Mosfilm International", country: "ru", category: "movie", logo: "", pinned: true,
      urls: ["http://stream.mcquack.net/369/index.m3u8"] }
  ];

  const MAJOR = [/перв|channel one|1tv/i, /россия|russia/i, /нтв|^ntv/i, /тнт|^tnt/i, /^стс|^sts/i, /рен тв|ren tv/i,
    /звезда|zvezda/i, /матч|match/i, /^мир|^mir/i, /пятниц/i, /культура/i, /беларусь|belarus|^онт|^ont|^ств|^ctv/i,
    /1\+1|ictv|інтер|^inter|стб|новий|україна|рада|еспресо|espreso|громадське|hromadske|5 канал/i, /кино|kino|movie/i, /rt|euronews/i];

  const FEATURED = [
    /[iıİ]dman|идман/i,
    /cbc[ -]?sport/i,
    /перв|channel one|^1tv/i,
    /россия[ -]?1\b|^russia[ -]?1\b|^россия$/i,
    /россия[ -]?24|russia[ -]?24|^вести/i,
    /рен[ -]?тв|ren[ -]?tv/i,
    /^стс$|^sts$/i,
    /^че!?$|^che!?$/i,
    /^5 канал|пятый канал|^5 kanal|^5 channel/i,
    /^нтв$|^ntv$/i,
    /матч|match/i,
    /пятниц|pyatnica|friday/i,
    /^тнт$|^tnt$/i,
    /^тв-?3$|^tv-?3$/i,
    /домашн|domashn/i,
    /россия[ -]?к\b|россия[ -]?культура|^культура|russia[ -]?k\b/i,
    /^мир$|^mir$/i,
    /тв[ -]?центр|^твц|tv cent/i,
    /суббота|subbota/i,
    /муз[ -]?тв|muz[ -]?tv/i,
    /^ю$|^yu$/i,
    /^отр$|^otr$/i,
    /стс[ -]?love|sts[ -]?love/i,
    /^78\b|канал 78|78 канал/i,
    /карусель|karusel|carousel/i,
    /солнце|solntse/i,
    /^спас|spas[ -]?tv/i,
    /звезда|zvezda/i,
    /соловьев|соловьёв|solovyov|solovyev/i,
    /^rt\b|russia today|^рт\b/i,
    /москва 24|moscow 24/i,
    /^рбк|^rbc/i,
    /победа|pobeda/i
  ];
  const featIdx = n => { n = n.replace(/\b(hd|sd|fhd|uhd)\b/ig, "").trim(); const i = FEATURED.findIndex(r => r.test(n)); return i < 0 ? 99 : i; };

  // Logos (put the png files in a "logos" folder next to index.html; if missing, initials are shown)
  const LOGOS = [
    { re: /россия[ -]?24|russia[ -]?24|^вести/i, logo: "logos/russia24.png" },
    { re: /^нтв$|^ntv$/i,                        logo: "logos/ntv.png" },
    { re: /перв|channel one|^1tv/i,              logo: "logos/perviy.png" },
    { re: /тв[ -]?центр|^твц|tv cent/i,          logo: "logos/tvc.png" },
    { re: /звезда|zvezda/i,                      logo: "logos/zvezda.png" },
    { re: /^5 канал|пятый канал|^5 kanal|^5 channel/i, logo: "logos/5kanal.png" }
  ];

  // Extra links (added to the playlist links; the first working one is used).
  // Entries with empty urls are skipped. Put a working .m3u8 inside urls: [""] to add that channel.
  const EXTRA = [
    { re: /^a spor$/i, name: "A Spor", category: "sport", country: "tr",
      urls: ["https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8"] },
    { re: /^ht ?spor/i, name: "HTSpor TV", category: "sport", country: "tr",
      urls: ["https://ciner.daioncdn.net/ht-spor/ht-spor.m3u8?app=web"] },
    { re: /победа|pobeda/i, name: "Победа", category: "other",
      urls: ["https://streaming.thestream.cyou/live/43.m3u8", "http://ott-cdn.ucom.am/s47/04.m3u8"] },
    { re: /пятниц|pyatnica/i, name: "Пятница", category: "other",
      urls: ["http://stream.mcquack.net/181/index.m3u8"] },
    { re: /^мир$|^mir$/i, name: "Мир", category: "other",
      urls: ["https://hls-mirtv.cdnvideo.ru/mirtv-parampublish/mirtv_2500/playlist.m3u8"] },
    { re: /звезда|zvezda/i, name: "Звезда", category: "other",
      urls: ["https://tvchannelstream1.tvzvezda.ru/cdn/tvzvezda/playlist_hdhigh.m3u8"] },
    { re: /^нтв$|^ntv$/i, name: "НТВ", category: "other",
      urls: ["http://cdn.ntv.ru/ntv0_hd/tracks-v1a1/mono.m3u8"] },
    { re: /^домашний$|^domashniy$/i, name: "Домашний", category: "other",
      urls: ["https://livetv.mylifeisgood.net.ru/channels/domashnii.m3u8",
             "https://zabava-htlive.cdn.ngenix.net/hls/CH_DOMASHNIY/variant.m3u8"] },

    // Your working links can go here:
    { re: /россия[ -]?24|russia[ -]?24/i, name: "Россия 24", category: "news",  urls: [] },
    { re: /карусель|karusel/i,            name: "Карусель",  category: "kids",  urls: [] },
    { re: /^отр$|^otr$/i,                 name: "ОТР",       category: "other", urls: [] },
    { re: /тв[ -]?центр|^твц/i,           name: "ТВЦ",       category: "other", urls: [] },
    { re: /^тв-?3$|^tv-?3$/i,             name: "ТВ-3",      category: "other", urls: [] },
    { re: /^спас|spas/i,                  name: "Спас",      category: "other", urls: [] },
    { re: /перв|channel one|^1tv/i,       name: "Первый канал", category: "other", urls: [] },
    { re: /^5 канал|пятый канал/i,        name: "5 канал",   category: "other", urls: [] }
  ];
  const rank = n => { const i = MAJOR.findIndex(r => r.test(n)); return i < 0 ? 99 : i; };

  /* ================= HELPERS ================= */
  const $ = id => document.getElementById(id);

  const oldBox = $("aliveOnly");
  if (oldBox) (oldBox.closest("label") || oldBox).remove();

  const el = {
    list: $("channelList"), count: $("channelCount"), search: $("searchInput"), info: $("sourceInfo"),
    video: $("mainVideo"), now: $("nowPlaying"), ph: $("playerPlaceholder"), status: $("playerStatus"),
    statusText: $("statusText"), loader: $("statusLoader"), dot: $("connectionDot"), pinfo: $("playerInfo"),
    retry: $("retryButton"), mos: $("mosfilmLink")
  };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const isHttpsPage = location.protocol === "https:";
  const norm = n => n.toLowerCase().replace(/\b(hd|sd|fhd|uhd)\b/g, "").replace(/[^\p{L}\p{N}]+/gu, "");
  const key = c => c.country + "|" + norm(c.name);
  const initials = n => n.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase();

  let speed = 1;
  const withTimeout = (ms) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms * speed);
    return { signal: c.signal, done: () => clearTimeout(t) };
  };

  let channels = [], category = "all", query = "", current = null, urlIdx = 0;
  let hls = null, timer = null, recovered = 0, checking = false, total = 0, done = 0, runId = 0;
  const favs = new Set(store.get("tvkino_favs", []));
  const CACHE_KEY = "tvkino_probe16";
  const cache = store.get(CACHE_KEY, {});

  const attemptsOf = c => c.urls.flatMap(u => {
    const out = [];
    if (!(isHttpsPage && /^http:/i.test(u))) out.push({ u, p: "" });
    if (PROXY) out.push({ u, p: PROXY });
    if (c.pinned || c.proxied) PUBLIC_PROXIES.forEach(p => out.push({ u, p }));
    return out;
  });
  const aid = a => (a.p ? a.p + "|" : "") + a.u;
  const via = a => url => (a.p ? a.p + encodeURIComponent(url) : url);
  const playList = c => {
    const l = attemptsOf(c), i = l.findIndex(a => aid(a) === c.best);
    return i > 0 ? [l[i], ...l.filter((_, k) => k !== i)] : l;
  };

  /* ================= PLAYLIST PARSING ================= */
  const mapCategory = g => {
    g = (g || "").toLowerCase();
    if (/movie|film|cinema|series|кино|фильм|сериал/.test(g)) return "movie";
    if (/news|новост|новин/.test(g)) return "news";
    if (/sport|спорт|\bspor|futbol|football|футбол|[iıİ]dman|идман|матч|\bmatch/i.test(g)) return "sport";
    if (/kid|animation|child|дет|мульт|діт/.test(g)) return "kids";
    if (/music|музык|музик/.test(g)) return "music";
    return "other";
  };
  function parseM3U(text, country) {
    const out = [], lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l.startsWith("#EXTINF")) continue;
      const name = (l.split(/,(?!.*,)/).pop() || "").replace(/\s*\[.*?\]|\s*\(.*?\)/g, "").replace(/[.\s]+$/, "").trim();
      const logo = (l.match(/tvg-logo="([^"]*)"/) || [])[1] || "";
      const group = (l.match(/group-title="([^"]*)"/) || [])[1] || "";
      let url = "", needsHeaders = false;
      for (let j = i + 1; j < lines.length; j++) {
        const n = lines[j].trim();
        if (n.startsWith("#EXTINF")) break;
        if (/^#EXTVLCOPT:http-(referr?er|user-agent)/i.test(n)) needsHeaders = true;
        if (n && !n.startsWith("#")) { url = n; i = j; break; }
      }
      if (name && !needsHeaders && /^https?:/i.test(url) && !/\.mpd(\?|$)|^udp|\/udp\//i.test(url))
        out.push({ name, logo, country, category: mapCategory(group + " " + name),
          urls: [url, ...(isHttpsPage && /^http:/i.test(url) ? [url.replace(/^http:/i, "https:")] : [])] });
    }
    return out;
  }
  function merge(list) {
    const map = new Map();
    list.forEach(c => {
      const k = key(c);
      if (!map.has(k)) return map.set(k, c);
      const m = map.get(k);
      c.urls.forEach(u => !m.urls.includes(u) && m.urls.push(u));
      if (!m.logo) m.logo = c.logo;
    });
    return [...map.values()];
  }
  async function fetchSource(s) {
    const t = withTimeout(15000);
    try {
      const r = await fetch(s.url, { signal: t.signal });
      if (!r.ok) throw new Error(r.status);
      const txt = await r.text();
      store.set("tvkino_src_" + s.url.slice(-40), { txt });
      return parseM3U(txt, s.country);
    } catch {
      const c = store.get("tvkino_src_" + s.url.slice(-40), null);
      return c ? parseM3U(c.txt, s.country) : [];
    } finally { t.done(); }
  }

  /* ================= HEALTH CHECK ================= */
  const isM3U = t => /^\s*#EXTM3U/.test(t || "");
  const firstUri = (txt, afterTag) => {
    const lines = txt.split(/\r?\n/).map(x => x.trim());
    let i = afterTag ? lines.findIndex(l => l.startsWith(afterTag)) : 0;
    if (i < 0) return null;
    return lines.slice(i + 1).find(l => l && !l.startsWith("#")) || null;
  };
  async function getText(u, ms) {
    const t = withTimeout(ms);
    try {
      const r = await fetch(u, { signal: t.signal, cache: "no-store" });
      return r.ok ? await r.text() : null;
    } catch { return null; } finally { t.done(); }
  }
  async function probeUrl(a) {
    const f = via(a);
    try {
      let base = a.u, txt = await getText(f(base), 6000);
      if (!isM3U(txt)) return false;
      for (let d = 0; d < 2 && txt.includes("#EXT-X-STREAM-INF"); d++) {
        const v = firstUri(txt, "#EXT-X-STREAM-INF");
        if (!v) return false;
        base = new URL(v, base).href;
        txt = await getText(f(base), 6000);
        if (!isM3U(txt)) return false;
      }
      const seg = firstUri(txt, null);
      if (!seg) return false;
      const segUrl = new URL(seg, base).href;
      const t = withTimeout(7000);
      try {
        const r = await fetch(f(segUrl), { signal: t.signal, cache: "no-store" });
        if (!r.ok || !r.body) return false;
        const rd = r.body.getReader();
        const { value } = await rd.read();
        rd.cancel().catch(() => {});
        return !!(value && value.length);
      } finally { t.done(); }
    } catch { return false; }
  }
  async function probe(c) {
    const list = attemptsOf(c);
    if (c.pinned || c.proxied) {
      const hit = await new Promise(res => {
        let n = list.length; if (!n) return res(null);
        list.forEach(a => probeUrl(a).then(ok => { if (ok) res(a); else if (--n === 0) res(null); }));
      });
      if (hit) { c.best = aid(hit); return true; }
      return false;
    }
    for (const a of list.slice(0, 3)) if (await probeUrl(a)) { c.best = aid(a); return true; }
    return false;
  }
  async function checkChannel(c) {
    c.alive = await probe(c);
    cache[key(c)] = c.alive ? { ok: true, best: c.best, t: Date.now() } : { ok: false, t: Date.now() };
    done++; if (done % 40 === 0) store.set(CACHE_KEY, cache); schedule();
  }
  async function runPool(queue, size, id) {
    let i = 0;
    const worker = async () => { while (i < queue.length && id === runId) await checkChannel(queue[i++]); };
    await Promise.all(Array.from({ length: size }, worker));
  }
  async function runProbe() {
    const id = ++runId;
    const now = Date.now();
    channels.forEach(c => {
      const v = cache[key(c)];
      if (v && now - v.t < (v.ok ? 6 : 2) * 60 * 60 * 1000) { c.alive = v.ok; if (v.best) c.best = v.best; }
    });
    const q1 = channels.filter(c => c.alive === undefined);
    total = q1.length; done = 0; checking = total > 0; speed = 1;
    await runPool(q1, 40, id);
    if (id === runId) {
      const q2 = channels.filter(c => c.alive === false && !c.retried);
      q2.forEach(c => { c.retried = true; });
      total += q2.length; checking = q2.length > 0; speed = 2;
      await runPool(q2, 20, id);
      speed = 1;
    }
    if (id === runId) { checking = false; store.set(CACHE_KEY, cache); schedule(true); }
  }

  /* ================= UI ================= */
  let sched = null;
  function schedule(now) {
    if (now) { clearTimeout(sched); sched = null; render(); return; }
    if (!sched) sched = setTimeout(() => { sched = null; render(); }, 700);
  }
  function visible() {
    const q = query.trim().toLowerCase();
    return channels.filter(c =>
      (category === "all" || c.category === category) &&
      (!q || c.name.toLowerCase().includes(q)) &&
      c.alive === true);
  }
  function updateInfo() {
    const alive = channels.filter(c => c.alive === true).length;
    el.info.textContent = checking
      ? `Kanallar yoxlanılır: ${done}/${total} · İşləyən: ${alive}`
      : `Yoxlama bitdi · İşləyən kanal: ${alive}`;
  }
  function render() {
    const list = visible().sort((a, b) => (favs.has(b.name) - favs.has(a.name)) || (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const top = el.list.scrollTop;
    el.count.textContent = list.length;
    updateInfo();
    el.list.textContent = "";
    if (!list.length) {
      el.list.innerHTML = '<div class="list-empty"></div>';
      el.list.firstChild.textContent = checking ? "İşləyən kanallar axtarılır..." : "İşləyən kanal tapılmadı. İnterneti yoxlayın və ya PROXY qurun.";
      return;
    }
    const frag = document.createDocumentFragment();
    let last = null;
    list.forEach(c => {
      const g = favs.has(c.name) ? "Sevimlilər" : COUNTRY[c.country] || "Digər";
      if (g !== last) { const h = document.createElement("div"); h.className = "group-title"; h.textContent = g; frag.appendChild(h); last = g; }
      const b = document.createElement("button");
      b.type = "button"; b._ch = c;
      b.className = "channel-item" + (current === c ? " active" : "") + (c.alive === false ? " dead" : "");
      const logo = document.createElement(c.logo ? "img" : "div");
      logo.className = "channel-logo";
      if (c.logo) {
        logo.src = c.logo; logo.alt = ""; logo.loading = "lazy"; logo.referrerPolicy = "no-referrer";
        logo.onerror = () => { const d = document.createElement("div"); d.className = "channel-logo"; d.textContent = initials(c.name); logo.replaceWith(d); };
      } else logo.textContent = initials(c.name);
      const meta = document.createElement("div");
      meta.className = "channel-meta";
      meta.innerHTML = '<div class="channel-name"></div><div class="channel-sub"></div>';
      meta.firstChild.textContent = c.name;
      meta.lastChild.textContent = (COUNTRY[c.country] || "") + (c.alive === true ? " · işləyir" : c.alive === false ? " · cavab vermir" : " · yoxlanılır");
      const fav = document.createElement("span");
      fav.className = "fav-btn" + (favs.has(c.name) ? " on" : ""); fav.dataset.fav = "1";
      fav.textContent = favs.has(c.name) ? "★" : "☆";
      b.append(logo, meta, fav);
      frag.appendChild(b);
    });
    el.list.appendChild(frag);
    el.list.scrollTop = top;
  }

  /* ================= PLAYER ================= */
  function setStatus(text, state, loader) {
    el.status.classList.toggle("hide", !text);
    el.statusText.textContent = text || "";
    el.loader.classList.toggle("hide", !loader);
    el.dot.className = "live-dot" + (state === "err" ? " err" : state === "wait" ? " wait" : "");
    el.pinfo.textContent = state === "ok" ? "Canlı yayım" : state === "err" ? "Xəta" : state === "wait" ? "Yüklənir..." : "Ready to watch";
  }
  function destroy() {
    clearTimeout(timer);
    if (hls) { hls.destroy(); hls = null; }
    el.video.pause(); el.video.removeAttribute("src"); el.video.load();
  }
  function play(c, idx = 0) {
    const a0 = playList(c)[idx]; c.playing = a0 ? a0.u : "";
    current = c; urlIdx = idx; recovered = 0;
    el.now.textContent = c.name;
    el.ph.classList.add("hide"); el.retry.hidden = true; el.mos.hidden = true;
    destroy();
    const list = playList(c), a = list[idx];
    if (!a) return fail("uyğun ünvan yoxdur");
    setStatus(`Kanal yüklənir... (${idx + 1}/${list.length})`, "wait", true);
    timer = setTimeout(() => fail("cavab gecikdi"), 15000);
    if (window.Hls && Hls.isSupported()) {
      const cfg = { enableWorker: true, lowLatencyMode: false, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 2, fragLoadingMaxRetry: 3 };
      if (a.p) {
        cfg.loader = class extends Hls.DefaultConfig.loader {
          load(ctx, conf, cb) {
            const orig = ctx.url, ok = cb.onSuccess;
            ctx.url = a.p + encodeURIComponent(orig);
            cb.onSuccess = (res, stats, c2, net) => { res.url = orig; c2.url = orig; ok(res, stats, c2, net); };
            super.load(ctx, conf, cb);
          }
        };
      }
      hls = new Hls(cfg);
      hls.on(Hls.Events.ERROR, (_, d) => {
        if (!d.fatal) return;
        if (d.type === Hls.ErrorTypes.MEDIA_ERROR && recovered++ < 2) return hls.recoverMediaError();
        fail(d.details || "axın xətası");
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => el.video.play().catch(() => {}));
      hls.loadSource(a.u); hls.attachMedia(el.video);
    } else { el.video.src = a.p ? a.p + encodeURIComponent(a.u) : a.u; el.video.play().catch(() => {}); }
    render();
  }
  function fail(reason) {
    clearTimeout(timer);
    if (!current) return;
    if (urlIdx + 1 < playList(current).length) return play(current, urlIdx + 1);
    current.alive = false; cache[key(current)] = { ok: false, t: Date.now() };
    destroy();
    setStatus(`Bu kanal hazırda açılmır (${reason}). Başqa kanal seçin.`, "err", false);
    el.retry.hidden = false;
    render();
  }
  el.video.addEventListener("playing", () => {
    clearTimeout(timer); if (current) current.alive = true; setStatus("", "ok", false);
    if (current && current.pinned && current.playing) {
      try { const u = new URL(current.playing); el.pinfo.textContent += " · " + u.host + u.pathname; } catch {}
    }
  });
  el.video.addEventListener("waiting", () => current && setStatus("Bufer yüklənir...", "wait", true));
  el.video.addEventListener("error", () => { if (!hls && current) fail("video xətası"); });

  /* ================= EVENTS ================= */
  el.list.addEventListener("click", e => {
    const b = e.target.closest(".channel-item");
    if (!b) return;
    if (e.target.dataset.fav) {
      const n = b._ch.name;
      favs.has(n) ? favs.delete(n) : favs.add(n);
      store.set("tvkino_favs", [...favs]);
      return render();
    }
    play(b._ch);
  });
  let st;
  el.search.addEventListener("input", () => { clearTimeout(st); st = setTimeout(() => { query = el.search.value; render(); }, 150); });
  document.querySelector(".category-filter").addEventListener("click", e => {
    const b = e.target.closest(".cat-btn");
    if (!b) return;
    document.querySelectorAll(".cat-btn").forEach(x => x.classList.toggle("active", x === b));
    category = b.dataset.category; render();
  });
  el.retry.addEventListener("click", () => current && play(current, 0));

  /* ================= START ================= */
  (async function init() {
    el.info.textContent = "IPTV mənbələrinə qoşulur...";
    const res = await Promise.all(SOURCES.map(fetchSource));
    const rest = res.flat().filter(c => !/мосфильм|mosfilm/i.test(c.name));
    EXTRA.forEach(x => {
      if (!x.urls.length) return;
      const hit = rest.filter(c => x.re.test(c.name));
      if (hit.length) hit.forEach(c => x.urls.forEach(u => !c.urls.includes(u) && c.urls.push(u)));
      else rest.push({ name: x.name, logo: "", country: x.country || "ru", category: x.category, urls: [...x.urls] });
    });
    const all = merge([...MOSFILM, ...rest]);
    all.forEach(c => {
      if (!c.pinned) {
        const L = LOGOS.find(x => x.re.test(c.name));
        if (L) c.logo = L.logo;
      }
      if (!c.pinned && featIdx(c.name) < 99) c.proxied = true;
    });
    all.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || featIdx(a.name) - featIdx(b.name) || rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
    channels = all;
    render();
    runProbe();
  })();
})();