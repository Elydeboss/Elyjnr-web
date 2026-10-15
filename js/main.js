/* ============================================================
   dev-portfolio interactions
   1. scroll rulers (top sticky + bottom)
   2. scrollspy nav
   3. mobile menu
   4. pixel-eraser hover zones
   5. "YOU" cursor tag
   6. copy-on-select pill
   7. reveal-on-scroll
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. scroll rulers — 1 scroll px = 1.3 ruler px (130px per 100)
     ---------------------------------------------------------- */
  var rulers = Array.prototype.slice.call(document.querySelectorAll(".ruler-track"));
  var PX_PER_UNIT = 1.3;

  function buildRulers() {
    var docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight * 4);
    var blocks = Math.ceil((docHeight * PX_PER_UNIT) / 130) + 6;
    rulers.forEach(function (track) {
      track.innerHTML = "";
      for (var i = 0; i <= blocks; i++) {
        var block = document.createElement("div");
        block.className = "ruler-block";

        var num = document.createElement("span");
        num.className = "num";
        num.textContent = String(i * 100);
        block.appendChild(num);

        var major = document.createElement("span");
        major.className = "tick-major";
        block.appendChild(major);

        for (var t = 0; t < 4; t++) {
          var minor = document.createElement("span");
          minor.className = "tick-minor";
          block.appendChild(minor);
        }
        track.appendChild(block);
      }
    });
    updateRulers();
  }

  var ticking = false;
  function updateRulers() {
    var x = -window.scrollY * PX_PER_UNIT;
    rulers.forEach(function (track) {
      track.style.transform = "translate3d(" + x + "px, 0, 0)";
    });
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateRulers);
    }
  }, { passive: true });

  window.addEventListener("resize", buildRulers);
  buildRulers();
  // rebuild once fonts/images settle
  window.addEventListener("load", buildRulers);

  /* ----------------------------------------------------------
     2. scrollspy
     ---------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-spy-section]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy-link]"));
  var contactBtn = document.querySelector(".contact-btn");

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-spy-link") === id);
    });
    if (contactBtn) {
      contactBtn.classList.toggle("is-active", id === "contact");
    }
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ----------------------------------------------------------
     3. mobile menu
     ---------------------------------------------------------- */
  var menuBtn = document.querySelector(".menu-btn");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      var label = menuBtn.querySelector(".menu-label");
      if (label) label.textContent = mobileMenu.classList.contains("open") ? "CLOSE" : "MENU";
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mobileMenu.classList.remove("open");
        var lbl = menuBtn.querySelector(".menu-label");
        if (lbl) lbl.textContent = "MENU";
      }
    });
  }

  /* ----------------------------------------------------------
     4. pixel-eraser hover zones
     ---------------------------------------------------------- */
  var GRID = 18;

  function initPixelZone(zone) {
    var pixelsWrap = zone.querySelector(".pz-pixels");
    if (!pixelsWrap) return;
    var squares = pixelsWrap.querySelectorAll("span");
    var raf = null;

    function move(e) {
      var rect = zone.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = null;
        var gx = Math.floor(x / GRID) * GRID;
        var gy = Math.floor(y / GRID) * GRID;
        var maxGX = Math.floor(rect.width / GRID) * GRID;
        var maxGY = Math.floor(rect.height / GRID) * GRID;
        gx = Math.max(0, Math.min(gx, maxGX - GRID));
        gy = Math.max(0, Math.min(gy, maxGY - GRID));
        var coords = [
          [gx, gy], [gx + GRID, gy],
          [gx, gy + GRID], [gx + GRID, gy + GRID]
        ];
        squares.forEach(function (sq, i) {
          sq.style.transform = "translate(" + coords[i][0] + "px," + coords[i][1] + "px)";
        });
      });
    }

    zone.addEventListener("mouseenter", function () {
      if (reduceMotion) return;
      zone.classList.add("active");
    });
    zone.addEventListener("mousemove", move);
    zone.addEventListener("mouseleave", function () {
      zone.classList.remove("active");
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".pixel-zone")).forEach(initPixelZone);

  /* ----------------------------------------------------------
     5. "YOU" cursor tag
     ---------------------------------------------------------- */
  var youTag = document.querySelector(".you-tag");
  if (youTag && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, shown = false, rafId = null;

    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      youTag.style.transform = "translate(" + cx + "px," + cy + "px)";
      rafId = window.requestAnimationFrame(loop);
    }

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX + 14;
      ty = e.clientY + 14;
      var overInteractive = !!(e.target.closest && e.target.closest("a, button, [data-hide-cursor]"));
      youTag.classList.toggle("show", shown && !overInteractive);
      if (!shown) {
        shown = true;
        cx = tx; cy = ty;
        if (rafId === null) loop();
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      youTag.classList.remove("show");
      shown = false;
    });
  }

  /* ----------------------------------------------------------
     6. copy-on-select pill
     ---------------------------------------------------------- */
  var copyPill = document.querySelector(".copy-pill");
  if (copyPill) {
    var copyLabel = copyPill.querySelector(".copy-label");
    var copyReset = null;

    function onSelectionChange() {
      var sel = window.getSelection();
      var text = sel ? String(sel).trim() : "";
      if (!text || text.length < 2) {
        copyPill.classList.remove("show");
        return;
      }
      var range = sel.getRangeAt(0);
      var rect = range.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) {
        copyPill.classList.remove("show");
        return;
      }
      copyPill.style.left = Math.min(rect.left + rect.width / 2 - 40, window.innerWidth - 110) + "px";
      copyPill.style.top = Math.max(8, rect.top - 40) + "px";
      if (copyLabel) copyLabel.textContent = "Copy";
      copyPill.classList.add("show");
    }

    document.addEventListener("selectionchange", function () {
      window.clearTimeout(copyReset);
      copyReset = window.setTimeout(onSelectionChange, 120);
    });

    copyPill.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var sel = window.getSelection();
      var text = sel ? String(sel) : "";
      if (!text) return;
      var done = function () {
        if (copyLabel) copyLabel.textContent = "Copied!";
        window.clearTimeout(copyReset);
        copyReset = window.setTimeout(function () {
          copyPill.classList.remove("show");
          if (copyLabel) copyLabel.textContent = "Copy";
        }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (err) { /* noop */ }
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* ----------------------------------------------------------
     6b. work gallery — "See" circle follows the cursor
     ---------------------------------------------------------- */
  Array.prototype.slice.call(document.querySelectorAll(".work-tile")).forEach(function (tile) {
    var circle = tile.querySelector(".see-circle");
    if (!circle) return;
    var raf = null;
    tile.addEventListener("mousemove", function (e) {
      if (raf) return;
      var rect = tile.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      raf = window.requestAnimationFrame(function () {
        raf = null;
        circle.style.transform = "translate(" + (x - 44) + "px," + (y - 44) + "px)";
      });
    }, { passive: true });
  });

  /* ----------------------------------------------------------
     6c. 📷 image-slot checklist (console summary on load)
     ---------------------------------------------------------- */
  window.addEventListener("load", function () {
    var slots = Array.prototype.slice.call(document.querySelectorAll("[data-slot]"));
    if (!slots.length) return;
    var pending = slots.filter(function (s) { return s.getAttribute("data-placeholder") === "true"; });
    console.log(
      "%c📷 IMAGE SLOTS%c " + slots.length + " total · " + pending.length + " still using placeholders",
      "background:#e3a92f;color:#141414;font-weight:bold;padding:2px 8px;",
      "color:inherit;padding:2px 4px;"
    );
    pending.forEach(function (s) {
      console.log("   ⬜ " + s.getAttribute("data-slot") + " — " + s.getAttribute("data-label"));
    });
  });

  /* ----------------------------------------------------------
     7. reveal-on-scroll
     ---------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var workTitle = document.querySelector(".work-title");

  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
    if (workTitle) ro.observe(workTitle);
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    if (workTitle) workTitle.classList.add("in");
  }
})();
