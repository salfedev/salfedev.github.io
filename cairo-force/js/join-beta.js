(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var FUNCTIONS_REGION = "us-central1";

  var form = document.getElementById("join-beta-form");
  if (!form) return;

  var emailInput = document.getElementById("email");
  var consentInput = document.getElementById("consent");
  var platformAndroid = document.getElementById("platform-android");
  var platformOther = document.getElementById("platform-other");
  var submitBtn = document.getElementById("submit-btn");
  var statusEl = document.getElementById("form-status");

  function showStatus(type, message) {
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + type;
    statusEl.setAttribute("role", "alert");
  }

  function clearStatus() {
    statusEl.className = "form-status";
    statusEl.removeAttribute("role");
    statusEl.textContent = "";
  }

  function setFieldError(groupId, message) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var err = group.querySelector(".field-error");
    if (message) {
      group.classList.add("has-error");
      if (err) err.textContent = message;
    } else {
      group.classList.remove("has-error");
      if (err) err.textContent = "";
    }
  }

  function validateEmail(value) {
    return EMAIL_RE.test(String(value).trim());
  }

  function getSelectedRole() {
    var checked = form.querySelector('input[name="role"]:checked');
    return checked ? checked.value : "";
  }

  function getPlatforms() {
    var platforms = [];
    if (platformAndroid && platformAndroid.checked) platforms.push("Android");
    if (platformOther && platformOther.checked) platforms.push("Other");
    return platforms;
  }

  function validateForm() {
    var ok = true;
    clearStatus();

    var email = emailInput.value.trim();
    if (!email) {
      setFieldError("email-group", "Email is required.");
      ok = false;
    } else if (!validateEmail(email)) {
      setFieldError("email-group", "Enter a valid email address.");
      ok = false;
    } else {
      setFieldError("email-group", "");
    }

    if (!getSelectedRole()) {
      setFieldError("role-group", "Choose Tester, Volunteer, or Both.");
      ok = false;
    } else {
      setFieldError("role-group", "");
    }

    if (getPlatforms().length === 0) {
      setFieldError("platform-group", "Select at least one platform.");
      ok = false;
    } else {
      setFieldError("platform-group", "");
    }

    if (!consentInput.checked) {
      setFieldError("consent-group", "You must agree to the privacy policy.");
      ok = false;
    } else {
      setFieldError("consent-group", "");
    }

    return ok;
  }

  function initFirebaseApp() {
    if (window.CairoForceFirebase && window.CairoForceFirebase.ensureApp) {
      return window.CairoForceFirebase.ensureApp();
    }
    if (typeof firebase === "undefined") return null;
    var config = window.CAIRO_FORCE_FIREBASE_CONFIG;
    if (!config || !config.apiKey) return null;
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    return firebase.app();
  }

  function initAppCheck() {
    var siteKey = window.CAIRO_FORCE_APP_CHECK_RECAPTCHA_SITE_KEY;
    if (!siteKey || typeof firebase.appCheck === "undefined") return;
    try {
      firebase.appCheck().activate(
        new firebase.appCheck.ReCaptchaV3Provider(siteKey),
        true
      );
    } catch (err) {
      console.warn("App Check init skipped", err);
    }
  }

  function getSubmitSignupCallable() {
    var app = initFirebaseApp();
    if (!app || typeof firebase.functions === "undefined") return null;
    initAppCheck();
    return firebase.app().functions(FUNCTIONS_REGION).httpsCallable("submitBetaSignup");
  }

  function friendlyCallableError(err) {
    if (!err) return "Something went wrong. Try again or email sal.abuewilly@gmail.com.";
    var code = err.code || "";
    if (code === "functions/resource-exhausted") {
      return "Too many attempts. Wait a bit and try again.";
    }
    if (code === "functions/invalid-argument") {
      return "Check the form fields and try again.";
    }
    return err.message || "Something went wrong. Try again or email sal.abuewilly@gmail.com.";
  }

  emailInput.addEventListener("input", function () {
    if (emailInput.value.trim() && validateEmail(emailInput.value)) {
      setFieldError("email-group", "");
    }
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validateForm()) return;

    var submitSignup = getSubmitSignupCallable();
    if (!submitSignup) {
      showStatus(
        "error",
        "Signup backend failed to load. Try again or email sal.abuewilly@gmail.com."
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    var payload = {
      email: emailInput.value.trim(),
      display_name: document.getElementById("display-name").value.trim(),
      role: getSelectedRole(),
      platforms: getPlatforms().join(", "),
      message: document.getElementById("message").value.trim(),
    };

    submitSignup(payload)
      .then(function () {
        if (window.CairoForceFirebase && window.CairoForceFirebase.logEvent) {
          window.CairoForceFirebase.logEvent("beta_signup", {
            role: payload.role,
            platforms: payload.platforms,
            content_group: "website",
          });
        }
        form.reset();
        showStatus(
          "success",
          "Thanks — you're on the list. We'll email you when the next beta build is ready."
        );
      })
      .catch(function (err) {
        console.error("submitBetaSignup failed", err);
        showStatus("error", friendlyCallableError(err));
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Join the beta";
      });
  });
})();
