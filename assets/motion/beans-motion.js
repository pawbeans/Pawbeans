/*
 * BEANS motion primitives — the only motion vocabulary BEANS videos use.
 * Spec and rationale: .claude/skills/beans-motion/SKILL.md (§6).
 *
 * Load after GSAP, before the composition script:
 *   <script src="../../assets/motion/beans-motion.js"></script>
 * Every function takes the composition's single paused GSAP timeline and
 * returns it, so calls chain. All motion is seek-safe: no clocks, no
 * Math.random, no infinite repeats.
 *
 * Do not change a timing or ease here for one video. If a video needs
 * different motion, change the bible first and every video inherits it.
 */
(function () {
  var EASE = {
    enter: "expo.out", // things arriving
    exit: "power2.in", // things leaving
    drift: "sine.inOut", // ambient camera / parallax
    settle: "power3.out", // small UI-ish moves, labels
    pop: "back.out(1.7)", // unit / suffix landing
    count: "power2.out", // number roll
  };

  // P1 — Camera push-in. Slow push across a beat; `punch` is the hook variant.
  function pushIn(tl, target, o) {
    o = o || {};
    var at = o.at || 0;
    if (o.punch) {
      tl.fromTo(target, { scale: o.from || 1.0 }, { scale: o.to || 1.14, duration: o.duration || 0.6, ease: EASE.enter }, at);
    } else {
      tl.fromTo(target, { scale: o.from || 1.0 }, { scale: o.to || 1.08, duration: o.duration || 3, ease: EASE.drift }, at);
    }
    return tl;
  }

  // P2 — Multi-layer parallax. layers: [{ el, depth }] with depth 0.2 (far bg)
  // 0.5 (mid) 1.0 (subject) 1.6 (foreground). Travel is the subject's travel in px.
  function parallax(tl, layers, o) {
    o = o || {};
    var at = o.at || 0;
    var duration = o.duration || 3;
    var travel = o.travel || 90;
    var axis = o.axis || "y";
    layers.forEach(function (l) {
      var d = travel * l.depth;
      var from = {}, to = { duration: duration, ease: EASE.drift };
      from[axis] = d / 2;
      to[axis] = -d / 2;
      tl.fromTo(l.el, from, to, at);
    });
    return tl;
  }

  // P3 — Shader wipe. Returns a HyperShader TransitionConfig entry.
  // BEANS uses ONE shader for every scene change: cross-warp-morph, 0.6s.
  function wipe(time, o) {
    o = o || {};
    return { time: time, shader: "cross-warp-morph", duration: o.duration || 0.6 };
  }

  // P4 — Kinetic headline reveal. Markup:
  //   <div class="bm-headline"><span class="bm-line"><span class="bm-word">Word</span> ...</span></div>
  // .bm-line clips (overflow:hidden); each .bm-word rises from below its mask.
  function headline(tl, container, o) {
    o = o || {};
    var at = o.at || 0;
    var words = document.querySelectorAll(container + " .bm-word");
    tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 0.6, ease: EASE.enter, stagger: o.stagger || 0.08 }, at);
    if (o.accent) {
      tl.fromTo(container + " .bm-accent", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: EASE.settle, transformOrigin: "left center" }, at + 0.3);
    }
    return tl;
  }

  function headlineOut(tl, container, o) {
    o = o || {};
    var words = document.querySelectorAll(container + " .bm-word");
    tl.to(words, { yPercent: -115, duration: 0.35, ease: EASE.exit, stagger: 0.04 }, o.at || 0);
    return tl;
  }

  // P5 — Data counter. Rolls a number into `el`; suffix pops in when it lands.
  //   <span class="bm-stat"><span class="bm-num">0</span><span class="bm-unit">%</span></span>
  function counter(tl, el, o) {
    o = o || {};
    var at = o.at || 0;
    var duration = o.duration || 1.2;
    var decimals = o.decimals || 0;
    var node = document.querySelector(el + " .bm-num");
    var state = { v: o.from || 0 };
    var fmt = function (v) {
      var s = v.toFixed(decimals);
      return o.thousands ? Number(s).toLocaleString("en-SG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s;
    };
    node.textContent = fmt(state.v);
    tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE.settle }, at);
    tl.to(state, { v: o.to, duration: duration, ease: EASE.count, onUpdate: function () { node.textContent = fmt(state.v); } }, at + 0.1);
    tl.fromTo(el + " .bm-unit", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: EASE.pop }, at + 0.1 + duration - 0.15);
    return tl;
  }

  // P6 — Character idle loop. Breath, tail wag, blink — finite repeats sized to
  // `duration` so the loop is seek-safe. Pass any subset of parts.
  // parts: { body, head, tail, earL, earR, eyes }  (selectors of rigged SVG groups)
  // o.tailOrigin: tail pivot (default "0% 100%", the tail root at bottom-left).
  function idle(tl, parts, o) {
    o = o || {};
    var at = o.at || 0;
    var duration = o.duration || 3;
    var breath = 2.4, wag = 0.36, blinkEvery = 3.2;
    if (parts.body) {
      tl.fromTo(parts.body, { scaleY: 1 }, { scaleY: 1.015, duration: breath / 2, ease: EASE.drift, yoyo: true, repeat: Math.max(1, Math.floor(duration / (breath / 2)) - 1), transformOrigin: "50% 100%" }, at);
    }
    if (parts.head) {
      tl.fromTo(parts.head, { rotation: -1.5 }, { rotation: 1.5, duration: breath, ease: EASE.drift, yoyo: true, repeat: Math.max(1, Math.floor(duration / breath) - 1) }, at);
    }
    if (parts.tail) {
      tl.fromTo(parts.tail, { rotation: -12 }, { rotation: 12, duration: wag, ease: EASE.drift, yoyo: true, repeat: Math.max(1, Math.floor(duration / wag) - 1), transformOrigin: o.tailOrigin || "0% 100%" }, at);
    }
    [parts.earL, parts.earR].forEach(function (ear, i) {
      if (!ear) return;
      tl.fromTo(ear, { rotation: 0 }, { rotation: i ? -6 : 6, duration: 0.18, ease: EASE.settle, yoyo: true, repeat: 1 }, at + 1.1 + i * 0.06);
    });
    if (parts.eyes) {
      for (var t = 0.8; t < duration - 0.2; t += blinkEvery) {
        tl.fromTo(parts.eyes, { scaleY: 1 }, { scaleY: 0.1, duration: 0.06, ease: "none", yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, at + t);
      }
    }
    return tl;
  }

  window.BEANS = { EASE: EASE, pushIn: pushIn, parallax: parallax, wipe: wipe, headline: headline, headlineOut: headlineOut, counter: counter, idle: idle };
})();
