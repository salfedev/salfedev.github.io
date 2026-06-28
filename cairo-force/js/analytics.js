/**
 * Cairo Force GitHub Pages — Firebase Analytics (GA4).
 * Shared init for index, privacy, and join-beta. Safe no-op if SDK missing.
 */
(function () {
  "use strict";

  function pageSlug() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop() || "";
    if (!file || file === "index.html") return "landing";
    return file.replace(/\.html$/i, "");
  }

  var PAGE_SLUG = pageSlug();

  function getConfig() {
    return window.CAIRO_FORCE_FIREBASE_CONFIG || null;
  }

  function ensureApp() {
    if (typeof firebase === "undefined") return null;
    var config = getConfig();
    if (!config || !config.apiKey) return null;
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    return firebase.app();
  }

  function getAnalytics() {
    if (typeof firebase === "undefined" || typeof firebase.analytics === "undefined") {
      return null;
    }
    ensureApp();
    try {
      return firebase.analytics();
    } catch (err) {
      console.warn("Cairo Force Analytics unavailable", err);
      return null;
    }
  }

  function logEvent(eventName, params) {
    var analytics = getAnalytics();
    if (!analytics) return;
    try {
      analytics.logEvent(eventName, params || {});
    } catch (err) {
      console.warn("Cairo Force Analytics logEvent failed", eventName, err);
    }
  }

  function logPageView() {
    logEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
      content_group: "website",
      screen_name: PAGE_SLUG,
    });
  }

  window.CairoForceFirebase = {
    ensureApp: ensureApp,
    getAnalytics: getAnalytics,
    logEvent: logEvent,
    logPageView: logPageView,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", logPageView);
  } else {
    logPageView();
  }
})();
