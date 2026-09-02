/* The Agentic AI Leap — landing page JS.
 * 1. Ascend particle canvas: streams of rising particles (orange + cyan),
 *    denser at the bottom, with the occasional spark. Pure canvas, ~60fps,
 *    pauses when the tab is hidden. Disabled by prefers-reduced-motion (CSS hides it).
 * 2. Countdown to 2026-11-03T09:00:00+08:00.
 * 3. Registration form -> POST /api/lead (Teragrid CRM), inline validation,
 *    success panel with .ics download + Google Calendar link + a local ref code.
 * Content renders without JS; this file only enhances.
 */
(function () {
  "use strict";

  /* ---------- 1. Ascend particle canvas ---------- */
  var canvas = document.getElementById("ascend-canvas");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var TRAILS = [
      { x: 0.06, hue: "orange" }, { x: 0.13, hue: "cyan" }, { x: 0.22, hue: "orange" },
      { x: 0.35, hue: "cyan" }, { x: 0.47, hue: "orange" }, { x: 0.58, hue: "cyan" },
      { x: 0.70, hue: "orange" }, { x: 0.80, hue: "cyan" }, { x: 0.90, hue: "orange" },
      { x: 0.96, hue: "cyan" }
    ];

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawn(trail) {
      var x0 = trail.x * W + (Math.random() * 40 - 20);
      particles.push({
        x: x0, y: H + 10,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.9 + Math.random() * 1.6),
        r: 1.6 + Math.random() * 2.6,
        hue: trail.hue,
        life: 0,
        maxLife: 380 + Math.random() * 260,
        flicker: Math.random() * Math.PI * 2
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var i, p, a, col;
      for (i = particles.length - 1; i >= 0; i--) {
        p = particles[i];
        p.life++;
        p.x += p.vx + Math.sin((p.y + p.life) * 0.012) * 0.18; // gentle sway
        p.y += p.vy;
        if (p.y < -20 || p.life > p.maxLife) { particles.splice(i, 1); continue; }
        var fade = p.life < 40 ? p.life / 40 : Math.min(1, (p.maxLife - p.life) / 90);
        a = fade * (0.75 + 0.25 * Math.sin(p.flicker + p.life * 0.08));
        col = p.hue === "orange" ? "255,140,70" : "127,216,255";
        // trail streak (long)
        ctx.strokeStyle = "rgba(" + col + "," + (a * 0.5).toFixed(3) + ")";
        ctx.lineWidth = p.r * 1.4;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 26, p.y + 34); ctx.stroke();
        // glow head: soft halo + bright core
        ctx.fillStyle = "rgba(" + col + "," + (a * 0.25).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    }

    var rafId = null, timer = null;
    resize();
    window.addEventListener("resize", resize);
    TRAILS.forEach(function (t, idx) {
      // stagger the streams so the field is alive immediately
      for (var k = 0; k < 4; k++) spawn(t);
    });
    timer = setInterval(function () {
      if (particles.length < 190) {
        spawn(TRAILS[Math.floor(Math.random() * TRAILS.length)]);
      }
    }, 90);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId), rafId = null;
      } else if (!rafId) { rafId = requestAnimationFrame(tick); }
    });
    rafId = requestAnimationFrame(tick);
  }

  /* ---------- 1b. Scroll effects ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    document.documentElement.classList.add("no-observer");
  }
  // subtle hero parallax: drift canvas content slower than scroll (desktop only)
  if (canvas && window.matchMedia("(min-width: 861px)").matches) {
    var hero = document.querySelector(".hero");
    var lastY = -1, ticking = false;
    window.addEventListener("scroll", function () {
      lastY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          if (hero && lastY < window.innerHeight) {
            hero.style.transform = "translateY(" + (lastY * 0.18) + "px)";
            hero.style.opacity = String(Math.max(0, 1 - lastY / (window.innerHeight * 0.9)));
          }
          ticking = false;
        });
      }
    }, { passive: true });
  }

  /* ---------- 2. Countdown ---------- */
  var EVENT_START = new Date("2026-11-03T09:00:00+08:00").getTime();
  var elD = document.getElementById("cd-d"), elH = document.getElementById("cd-h"),
      elM = document.getElementById("cd-m"), elS = document.getElementById("cd-s"),
      cd = document.getElementById("countdown");
  function pad(n) { return String(n).padStart(2, "0"); }
  function countdown() {
    var diff = EVENT_START - Date.now();
    if (diff <= 0) {
      if (cd) cd.innerHTML = '<div class="cd-cell" style="min-width:220px"><span style="font-size:22px;letter-spacing:2px">TODAY IS THE DAY</span></div>';
      return;
    }
    var d = Math.floor(diff / 86400000),
        h = Math.floor(diff % 86400000 / 3600000),
        m = Math.floor(diff % 3600000 / 60000),
        s = Math.floor(diff % 60000 / 1000);
    [[elD, d], [elH, h], [elM, m], [elS, s]].forEach(function (pair) {
      var el = pair[0], v = pad(pair[1]);
      if (el && el.textContent !== v) {
        el.textContent = v;
        el.classList.remove("tick");
        void el.offsetWidth; // restart animation
        el.classList.add("tick");
      }
    });
    setTimeout(countdown, 1000);
  }
  if (cd) countdown();

  /* ---------- 3. Registration form ---------- */
  var API = "https://api.aitg.com.my/api/lead";
  var COMPANY = "teragrid-demo";

  var form = document.getElementById("reg-form"),
      errBox = document.getElementById("f-error"),
      btn = document.getElementById("f-submit"),
      success = document.getElementById("form-success");

  function showErr(msg) {
    if (!errBox) return;
    errBox.textContent = msg; errBox.hidden = false;
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errBox.hidden = true;

      var name = document.getElementById("f-name"),
          company = document.getElementById("f-company"),
          email = document.getElementById("f-email"),
          phone = document.getElementById("f-phone"),
          title = document.getElementById("f-title");

      [name, email, phone].forEach(function (el) { el.classList.remove("invalid"); });

      var missing = [];
      if (!name.value.trim()) { name.classList.add("invalid"); missing.push("name"); }
      if (!email.value.trim() || !validEmail(email.value.trim())) { email.classList.add("invalid"); missing.push("a valid email"); }
      if (!phone.value.trim()) { phone.classList.add("invalid"); missing.push("mobile number"); }
      if (missing.length) { showErr("Please provide your " + missing.join(", ") + "."); return; }

      btn.disabled = true;
      btn.textContent = "Registering…";

      var notes = title && title.value.trim() ? "Title: " + title.value.trim() : null;

      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyCode: COMPANY,
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          company: company && company.value.trim() ? company.value.trim() : null,
          notes: notes,
          tags: ["agentic-ai-leap-2026"]
        })
      }).then(function (r) {
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (d) { throw new Error(d.error || "Registration failed (" + r.status + ")"); });
        return r.json();
      }).then(function (d) {
        form.hidden = true;
        success.hidden = false;
        var ref = (d.contactId || "").slice(-8).toUpperCase() || "AIL-2026";
        var refEl = document.getElementById("succ-ref");
        if (refEl) refEl.textContent = ref;
        var msg = document.getElementById("succ-msg");
        if (msg && d.duplicate) msg.textContent = "You were already on our list — we've updated your details. See you on November 3!";
        var gcal = document.getElementById("gcal-link");
        if (gcal) {
          var params = new URLSearchParams({
            action: "TEMPLATE", text: "The Agentic AI Leap — AITG × Akamai",
            dates: "20261103T010000Z/20261103T060000Z",
            details: "Transforming Businesses from Digital to Autonomous. Penang Marriott Hotel, Ballroom.",
            location: "Penang Marriott Hotel, Ballroom"
          });
          gcal.href = "https://calendar.google.com/calendar/render?" + params.toString();
        }
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = "Register Me →";
        showErr(err && err.message ? err.message : "Something went wrong — please try again in a moment.");
      });
    });
  }
})();
