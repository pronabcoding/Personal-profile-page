/* ==========================================================
   Pronab Sutradhar portfolio: vanilla JavaScript
   Nav, active link, reveal, filter, starfield,
   robot eyes, rocket (scroll + back to top), mini game, form
   ========================================================== */
(function () {
  "use strict";

  /* ---- CONFIG ------------------------------------------------
     FORM_ENDPOINT: optional real form backend URL (see README).
     When empty, the form opens a pre-filled email draft. */
  const CONTACT_EMAIL = "sutradharpronab628@gmail.com";
  const FORM_ENDPOINT = "";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* storage blocked */ } }
  };

  document.documentElement.classList.add("js");

  /* ---- MOBILE MENU ------------------------------------------- */
  const nav = $("#nav"), menuBtn = $("#menuToggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
  });
  $$(".nav-link").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---- ACTIVE NAV LINK --------------------------------------- */
  const navLinks = $$(".nav-link");
  const sections = navLinks.map((l) => document.getElementById(l.dataset.section)).filter(Boolean);
  function setActive(id) {
    navLinks.forEach((l) => {
      const on = l.dataset.section === id;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach((s) => spy.observe(s));
  }
  setActive("home");

  /* ---- REVEAL ON SCROLL -------------------------------------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- PROJECT FILTER ---------------------------------------- */
  const filterBtns = $$(".filter"), cards = $$("#projectGrid .project"), emptyMsg = $("#filterEmpty");
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    let shown = 0;
    cards.forEach((c) => {
      // the "more missions" card has data-tags="all-only", so it shows only under All
      const match = f === "all" || c.dataset.tags.split(" ").includes(f);
      c.hidden = !match;
      if (match) shown++;
    });
    emptyMsg.hidden = shown !== 0;
  }));

  /* ---- STARFIELD (canvas background) ------------------------- */
  (function stars() {
    const cv = $("#stars"), ctx = cv.getContext("2d");
    let w, h, list = [];
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      list = Array.from({ length: Math.round(innerWidth / 9) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.3 + 0.3) * dpr, v: Math.random() * 0.25 + 0.05
      }));
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(190, 255, 220, 0.55)";
      list.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });
    }
    function tick() {
      list.forEach((s) => { s.y += s.v; if (s.y > h) { s.y = 0; s.x = Math.random() * w; } });
      draw();
      requestAnimationFrame(tick);
    }
    addEventListener("resize", resize);
    resize();
    if (!reduceMotion) requestAnimationFrame(tick); // static stars when motion is reduced
  })();

  /* ---- ROBOT EYES FOLLOW THE POINTER ------------------------- */
  (function robot() {
    const svg = $("#robot");
    if (!svg || reduceMotion) return;
    const pupils = $$(".r-pupil", svg);
    addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.42;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 200) * 7; // max 7 SVG units of eye movement
      pupils.forEach((p) => { p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`; });
    }, { passive: true });
  })();

  /* ---- ROCKET: climbs as you scroll; click = back to top ----- */
  const rocket = $("#toTop"), bar = $("#progressBar");
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.width = (p * 100).toFixed(1) + "%";
    const travel = innerHeight - 72 - 100;           // room between bottom pad and the HUD bar
    rocket.style.setProperty("--rk-y", (20 + p * travel).toFixed(0) + "px");
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  rocket.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---- AVATAR FALLBACK --------------------------------------- */
  $("#avatar").addEventListener("error", function () { this.style.visibility = "hidden"; });

  /* ---- MINI GAME: rocket dodge ------------------------------- */
  (function game() {
    const cv = $("#gameCanvas"), ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const scoreEl = $("#gScore"), bestEl = $("#gBest"), msg = $("#gMsg"), startBtn = $("#gStart");
    let best = parseFloat(store.get("rocketBest")) || 0;
    bestEl.textContent = best.toFixed(1);

    let running = false, t = 0, spawn = 0, last = 0, raf = 0;
    let ship, rocks, dir; // dir: -1 left, 0 none, 1 right
    const keys = { left: false, right: false, pointerX: null };

    function reset() { ship = { x: W / 2, y: H - 40, w: 22 }; rocks = []; t = 0; spawn = 0; dir = 0; }
    reset();

    function drawShip() {
      ctx.fillStyle = "#eafff3";
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 20); ctx.lineTo(ship.x + 11, ship.y + 14); ctx.lineTo(ship.x - 11, ship.y + 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#39ff88"; ctx.fillRect(ship.x - 3, ship.y - 2, 6, 6);
      if (running) { ctx.fillStyle = "#ffb020"; ctx.beginPath(); ctx.moveTo(ship.x - 5, ship.y + 14); ctx.lineTo(ship.x, ship.y + 14 + 8 + Math.random() * 8); ctx.lineTo(ship.x + 5, ship.y + 14); ctx.fill(); }
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(190,255,220,0.5)";
      for (let i = 0; i < 30; i++) ctx.fillRect((i * 97) % W, (i * 53 + t * 40) % H, 1.5, 1.5);
      rocks.forEach((r) => { ctx.strokeStyle = "#8fa59c"; ctx.fillStyle = "#0a1114"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.fill(); ctx.stroke(); });
      drawShip();
    }
    function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      t += dt; spawn -= dt;
      if (spawn <= 0) { rocks.push({ x: Math.random() * (W - 40) + 20, y: -20, r: 9 + Math.random() * 12, v: 110 + Math.random() * 80 + t * 6 }); spawn = Math.max(0.25, 0.8 - t * 0.012); }
      if (keys.pointerX !== null) ship.x += Math.max(-300 * dt, Math.min(300 * dt, keys.pointerX - ship.x));
      else ship.x += ((keys.right || dir > 0 ? 1 : 0) - (keys.left || dir < 0 ? 1 : 0)) * 240 * dt;
      ship.x = Math.max(14, Math.min(W - 14, ship.x));
      rocks.forEach((r) => { r.y += r.v * dt; });
      rocks = rocks.filter((r) => r.y < H + 30);
      for (const r of rocks) { if (Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + 11) { end(); return; } }
      scoreEl.textContent = t.toFixed(1);
      render();
      raf = requestAnimationFrame(step);
    }
    function start() {
      cancelAnimationFrame(raf); reset(); running = true; msg.textContent = "Dodge the asteroids!"; startBtn.textContent = "Restart";
      last = performance.now(); raf = requestAnimationFrame(step);
    }
    function end() {
      running = false; render();
      const newBest = t > best;
      if (newBest) { best = t; store.set("rocketBest", String(best)); bestEl.textContent = best.toFixed(1); }
      scoreEl.textContent = t.toFixed(1);
      msg.textContent = "Crash! You lasted " + t.toFixed(1) + "s." + (newBest ? " New best!" : "") + " Press Restart to try again.";
    }

    startBtn.addEventListener("click", start);
    // Arrow keys / A / D. Arrow keys are only captured while a game is running, so the page still scrolls normally otherwise.
    addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { if (running) { keys.left = true; e.preventDefault(); } }
      if (k === "arrowright" || k === "d") { if (running) { keys.right = true; e.preventDefault(); } }
    });
    addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.left = false;
      if (k === "arrowright" || k === "d") keys.right = false;
    });
    // On-screen buttons: hold to move
    [["gLeft", -1], ["gRight", 1]].forEach(([id, d]) => {
      const b = $("#" + id);
      b.addEventListener("pointerdown", () => { dir = d; });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => { if (dir === d) dir = 0; }));
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { dir = d; } });
      b.addEventListener("keyup", () => { if (dir === d) dir = 0; });
    });
    // Drag/touch on the canvas
    function px(e) { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * (W / r.width); }
    cv.addEventListener("pointerdown", (e) => { if (running) { keys.pointerX = px(e); cv.setPointerCapture(e.pointerId); } });
    cv.addEventListener("pointermove", (e) => { if (keys.pointerX !== null) keys.pointerX = px(e); });
    ["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => { keys.pointerX = null; }));
    render();
  })();

  /* ---- CONTACT FORM ------------------------------------------ */
  const form = $("#contactForm"), status = $("#formStatus");
  const fields = {
    name: { el: $("#name"), check: (v) => (v.trim().length >= 2 ? "" : "Please enter your name.") },
    email: { el: $("#email"), check: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.") },
    message: { el: $("#message"), check: (v) => (v.trim().length >= 10 ? "" : "Please write at least 10 characters.") }
  };
  function validateField(key) {
    const { el, check } = fields[key];
    const msg = check(el.value);
    $("#" + key + "-err").textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  Object.keys(fields).forEach((k) => {
    fields[k].el.addEventListener("blur", () => validateField(k));
    fields[k].el.addEventListener("input", () => { if (fields[k].el.getAttribute("aria-invalid") === "true") validateField(k); });
  });
  function setStatus(text, kind) { status.textContent = text; status.className = "form-status" + (kind ? " is-" + kind : ""); }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");
    if (Object.keys(fields).map(validateField).includes(false)) {
      fields[Object.keys(fields).find((k) => fields[k].el.getAttribute("aria-invalid") === "true")].el.focus();
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }
    const data = { name: fields.name.el.value.trim(), email: fields.email.el.value.trim(), message: fields.message.el.value.trim() };
    if (FORM_ENDPOINT) {
      try {
        setStatus("Sending…", "");
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        setStatus("Message sent. Thank you!", "ok");
      } catch (_) {
        setStatus("Sorry, the message could not be sent. Please email me directly at " + CONTACT_EMAIL + ".", "error");
      }
      return;
    }
    // No backend: open a pre-filled email draft. Nothing is sent until the user presses Send there.
    const subject = encodeURIComponent("Portfolio message from " + data.name);
    const body = encodeURIComponent(data.message + "\n\n— " + data.name + " (" + data.email + ")");
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    setStatus("Your email app should open with the message filled in. It is only sent once you press Send there. If nothing opens, email " + CONTACT_EMAIL + " or use the Google Form link.", "ok");
  });

  /* ---- FOOTER YEAR ------------------------------------------- */
  $("#year").textContent = new Date().getFullYear();
})();
