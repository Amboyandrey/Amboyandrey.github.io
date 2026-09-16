document.documentElement.classList.add("js");

/* ---------- theme ---------- */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (_) {}
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;

  btn.addEventListener("click", () => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = root.dataset.theme || (systemDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (_) {}
  });
})();

/* ---------- streaming hero ---------- */
(function () {
  const out = document.getElementById("stream");
  const tokensEl = document.getElementById("chat-tokens");
  const status = document.getElementById("chat-status");
  const toolCall = document.getElementById("tool-call");
  const replay = document.getElementById("chat-replay");
  const model = document.getElementById("chat-model");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const models = ["claude-sonnet-5", "gpt-5", "gemini-2.5-pro", "llama-3.3-70b (ollama)"];
  const text =
    "Andrey is a software engineer who builds AI platforms end to end. " +
    "Backend in Python and FastAPI on PostgreSQL with pgvector; streaming over SSE that survives a " +
    "refreshed tab; tool-calling agents that can delegate to each other; multi-tenant systems " +
    "backstopped by row-level security. Frontend in Next.js and TypeScript. " +
    "He tests against a real database, ships through pull requests, and writes the architecture " +
    "doc before you ask for it.";

  // Split into LLM-ish tokens: words and punctuation, sometimes sub-word chunks.
  const tokens = text.match(/\S+\s*|\s+/g) || [text];

  let timer = null;
  let cursor;

  function reset() {
    clearTimeout(timer);
    out.textContent = "";
    cursor = document.createElement("span");
    cursor.className = "cursor";
    out.appendChild(cursor);
    tokensEl.textContent = "0 tokens";
    toolCall.hidden = true;
    status.innerHTML = '<span class="pulse"></span> SSE · streaming';
    model.textContent = models[Math.floor(Math.random() * models.length)];
  }

  function run() {
    reset();
    if (reduced) {
      out.textContent = text;
      tokensEl.textContent = tokens.length + " tokens";
      status.textContent = "done";
      toolCall.hidden = false;
      return;
    }
    let i = 0;
    const step = () => {
      if (i >= tokens.length) {
        cursor.remove();
        status.textContent = "done · " + tokens.length + " tokens";
        toolCall.hidden = false;
        return;
      }
      cursor.before(document.createTextNode(tokens[i]));
      i += 1;
      tokensEl.textContent = i + " tokens";
      // Variable latency, with the occasional stall — the real thing isn't perfectly smooth either.
      const delay = Math.random() < 0.06 ? 260 : 28 + Math.random() * 60;
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, 500);
  }

  replay.addEventListener("click", run);
  run();
})();

/* ---------- project reveal + cursor glow ---------- */
(function () {
  const projects = document.querySelectorAll(".project");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  projects.forEach((p) => {
    io.observe(p);
    p.addEventListener("pointermove", (ev) => {
      const r = p.getBoundingClientRect();
      p.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100) + "%");
    });
  });
})();

/* ---------- system map tooltips ---------- */
(function () {
  const tip = document.getElementById("sysmap-tip");
  const nodes = document.querySelectorAll(".sysmap .node");
  const idle = tip.textContent;
  nodes.forEach((n) => {
    const show = () => { nodes.forEach((m) => m.classList.remove("hot")); n.classList.add("hot"); tip.textContent = n.dataset.tip; };
    n.addEventListener("pointerenter", show);
    n.addEventListener("click", show);
    n.addEventListener("focus", show);
    n.setAttribute("tabindex", "0");
    n.addEventListener("pointerleave", () => { n.classList.remove("hot"); tip.textContent = idle; });
  });
})();

/* ---------- active nav link ---------- */
(function () {
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => io.observe(s));
})();

document.getElementById("year").textContent = new Date().getFullYear();
