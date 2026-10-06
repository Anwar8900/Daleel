/* ==========================================================================
   دليل القاصد — السلوك التفاعلي
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var store = {
    get: function (k) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, v); } catch (e) { /* تجاهل */ }
    }
  };

  /* ---------- المظهر: نهاري / ليلي ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", theme === "dark" ? "#0f1a14" : "#ffffff"); }
  }

  function initTheme() {
    var saved = store.get("daqiq-theme");
    var theme = saved;
    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = prefersDark ? "dark" : "light";
    }
    applyTheme(theme);

    document.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-theme-toggle]") : null;
      if (!btn) return;
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("daqiq-theme", next);
    });

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) {
        if (!store.get("daqiq-theme")) { applyTheme(e.matches ? "dark" : "light"); }
      };
      if (mq.addEventListener) { mq.addEventListener("change", onChange); }
      else if (mq.addListener) { mq.addListener(onChange); }
    }
  }

  /* ---------- القائمة الجوّالة ---------- */
  function initNav() {
    var btn = document.querySelector("[data-menu-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.target.closest("[data-menu-toggle]")) return;
      if (e.target.closest(".main-nav")) return;
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    });
    var links = document.querySelectorAll(".main-nav a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ---------- ظلّ الهيدر عند التمرير ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var update = function () {
      if (window.scrollY > 8) { header.classList.add("scrolled"); }
      else { header.classList.remove("scrolled"); }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- زرّ العودة للأعلى ---------- */
  function initToTop() {
    var btn = document.querySelector("[data-to-top]");
    if (!btn) return;
    var update = function () {
      if (window.scrollY > 500) { btn.classList.add("is-visible"); }
      else { btn.classList.remove("is-visible"); }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- الظهور التدريجي للعناصر ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) { els[i].classList.add("is-visible"); }
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- تحميل الصور مع ظهور ناعم ---------- */
  function initLazyFade() {
    var imgs = document.querySelectorAll("img[data-fade]");
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("is-loaded");
        return;
      }
      img.classList.add("is-loading");
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
      img.addEventListener("error", function () { img.classList.add("is-loaded"); });
    });
  }

  /* ---------- سنة حقوق النشر ---------- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) { y.textContent = new Date().getFullYear(); }
  }

  /* ---------- التشغيل ---------- */
  function init() {
    initTheme();
    initNav();
    initHeaderScroll();
    initToTop();
    initReveal();
    initLazyFade();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
