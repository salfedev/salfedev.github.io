(function () {
  "use strict";

  var FORM_ACTION = "https://formspree.io/f/PLACEHOLDER";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var form = document.getElementById("join-beta-form");
  if (!form) return;

  form.setAttribute("action", FORM_ACTION);

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

  emailInput.addEventListener("input", function () {
    if (emailInput.value.trim() && validateEmail(emailInput.value)) {
      setFieldError("email-group", "");
    }
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validateForm()) return;

    if (FORM_ACTION.indexOf("PLACEHOLDER") !== -1) {
      showStatus(
        "error",
        "Form is not configured yet. Replace PLACEHOLDER in join-beta.js with your Formspree form ID (see web/README.md)."
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
      _subject: "Cairo Force beta signup",
    };

    fetch(FORM_ACTION, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          showStatus(
            "success",
            "Thanks — you're on the list. We'll email you when the next beta build is ready."
          );
        } else {
          return res.json().then(function (data) {
            throw new Error(data.error || "Submission failed.");
          });
        }
      })
      .catch(function (err) {
        showStatus(
          "error",
          err.message || "Something went wrong. Try again or email sal.abuewilly@gmail.com."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Join the beta";
      });
  });

})();
