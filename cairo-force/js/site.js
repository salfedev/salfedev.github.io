(function () {
  "use strict";

  initHeroLogoGleam();

  var sectionNav = document.querySelector(".section-nav");
  if (!sectionNav) return;

  var toggle = sectionNav.querySelector(".section-nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = sectionNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var navLinks = sectionNav.querySelectorAll('a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ link: link, sec: sec });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            var active = sectionNav.querySelector('a[href="#' + entry.target.id + '"]');
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      observer.observe(s.sec);
    });
  }

  /**
   * Mirror MainMenu UiGleamFx.attach_to_texture_rect — green-gold sweep on logo alpha.
   * CYCLE_SEC 4.2, SWEEP_FRAC 0.38, shine_angle ~0.35 (diagonal band in CSS).
   */
  function initHeroLogoGleam() {
    var wrap = document.querySelector(".hero-logo-wrap");
    if (!wrap) return;

    var img = wrap.querySelector(".hero-logo");
    var shine = wrap.querySelector(".hero-logo-shine");
    if (!img || !shine) return;

    function applyMask() {
      var src = img.currentSrc || img.src;
      if (!src) return;
      var mask = "url('" + src + "')";
      shine.style.maskImage = mask;
      shine.style.webkitMaskImage = mask;
    }

    if (img.complete) {
      applyMask();
    } else {
      img.addEventListener("load", applyMask, { once: true });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var cycleSec = 4.2;
    shine.style.animationDelay = (-Math.random() * cycleSec) + "s";
  }
})();
