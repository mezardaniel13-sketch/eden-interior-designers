(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero background video ---------- */
  var heroVideo = document.querySelector("[data-hero-video]");
  if (heroVideo) {
    if (prefersReducedMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      heroVideo.play().catch(function () {});
    }
  }

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var mobileNavClose = document.querySelector(".mobile-nav-close");
  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    mobileNav.removeAttribute("hidden");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var firstLink = mobileNav.querySelector("a");
    if (firstLink) firstLink.focus();
  }
  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      if (!mobileNav.classList.contains("is-open")) mobileNav.setAttribute("hidden", "");
    }, prefersReducedMotion ? 0 : 320);
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.contains("is-open");
      if (isOpen) { closeNav(); } else { openNav(); }
    });
    if (mobileNavClose) mobileNavClose.addEventListener("click", closeNav);
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, i) {
            if (entry.isIntersecting) {
              window.setTimeout(function () {
                entry.target.classList.add("is-visible");
              }, (i % 6) * 60);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Portfolio filter ---------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var galleryItems = document.querySelectorAll("[data-category]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      var filter = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  }

  /* ---------- Before / After slider ---------- */
  document.querySelectorAll("[data-ba-slider]").forEach(function (slider) {
    var afterWrap = slider.querySelector(".ba-after-wrap");
    var handle = slider.querySelector(".ba-handle");
    var afterImg = slider.querySelector(".ba-after-wrap img");

    function syncImageWidth() {
      if (afterImg) afterImg.style.width = slider.clientWidth + "px";
    }
    function setPosition(pct) {
      pct = Math.max(2, Math.min(98, pct));
      afterWrap.style.width = pct + "%";
      handle.style.left = pct + "%";
    }
    function pctFromClientX(clientX) {
      var rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    syncImageWidth();
    window.addEventListener("resize", syncImageWidth);

    var dragging = false;
    function onMove(clientX) {
      setPosition(pctFromClientX(clientX));
    }
    slider.addEventListener("pointerdown", function (e) {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      onMove(e.clientX);
    });
    slider.addEventListener("pointermove", function (e) {
      if (dragging) onMove(e.clientX);
    });
    slider.addEventListener("pointerup", function () { dragging = false; });
    slider.addEventListener("pointercancel", function () { dragging = false; });

    handle.setAttribute("tabindex", "0");
    handle.setAttribute("role", "slider");
    handle.setAttribute("aria-label", "Drag to compare before and after");
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "100");
    handle.setAttribute("aria-valuenow", "50");
    handle.addEventListener("keydown", function (e) {
      var current = parseFloat(afterWrap.style.width) || 50;
      var step = 5;
      if (e.key === "ArrowLeft") { setPosition(current - step); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPosition(current + step); e.preventDefault(); }
      handle.setAttribute("aria-valuenow", String(Math.round(parseFloat(afterWrap.style.width) || 50)));
    });
  });

  /* ---------- Contact form (client-side validation, no backend wired) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusBox = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var wrapper = field.closest(".form-field");
        var value = field.value.trim();
        var ok = value.length > 0;
        if (field.type === "email" && ok) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (wrapper) wrapper.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });

      if (!statusBox) return;
      if (!valid) {
        statusBox.textContent = "Please fill in the highlighted fields correctly.";
        statusBox.className = "form-status is-error";
        statusBox.focus();
        return;
      }
      statusBox.textContent =
        "Thanks — your message is ready to send. This form isn't connected to an inbox yet; please email info@edeninteriordesigners.com directly, or wire this form up to a service like Formspree.";
      statusBox.className = "form-status is-success";
      statusBox.setAttribute("tabindex", "-1");
      statusBox.focus();
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
