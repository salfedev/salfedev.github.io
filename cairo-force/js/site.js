(function () {
  "use strict";

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
})();
