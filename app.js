(function () {
  "use strict";

  var CFG = window.SURVEY_CONFIG || {};
  var OTHER = "Other";

  /* ------------------------------------------------------------------ *
   * Question definitions (wording per the survey brief)
   * `scores` maps each option to a number for analysis: higher = better.
   * ------------------------------------------------------------------ */
  var QUESTIONS = [
    {
      id: "q1_ease_of_use",
      type: "single",
      title: "How easy do you find the Lead Management System to use?",
      options: ["Very easy", "Easy", "Neutral", "Difficult", "Very difficult"],
      scores: [5, 4, 3, 2, 1],
    },
    {
      id: "q2_functionality",
      type: "single",
      title: "Does the system provide all the functionality you need to manage your leads effectively?",
      options: ["Yes, completely", "Mostly", "Partially", "No"],
      scores: [4, 3, 2, 1],
    },
    {
      id: "q3_lead_tracking",
      type: "single",
      title: "How effectively does the system help you track leads from allocation to final outcome?",
      options: ["Very effectively", "Effectively", "Moderately", "Ineffectively", "Very ineffectively"],
      scores: [5, 4, 3, 2, 1],
    },
    {
      id: "q4_challenges",
      type: "multi",
      title: "What are your biggest challenges when using the system?",
      hint: "Select all that apply",
      options: [
        "Difficult to navigate",
        "Slow performance or technical issues",
        "Incomplete lead information",
        "Difficulty updating lead statuses",
        "Inefficient lead allocation",
        "Limited reporting and visibility",
        "Insufficient training or support",
        "No significant challenges",
        OTHER,
      ],
      exclusive: "No significant challenges",
    },
    {
      id: "q5_reporting_confidence",
      type: "single",
      title: "How confident are you in the system's ability to support accurate lead tracking and conversion reporting?",
      options: ["Very confident", "Confident", "Somewhat confident", "Not very confident", "Not confident at all"],
      scores: [5, 4, 3, 2, 1],
    },
    {
      id: "q6_improvement",
      type: "text",
      title: "What one improvement would make the system more effective for your dealership?",
      placeholder: "Type your answer…",
    },
    {
      id: "q7_prequalification",
      type: "single",
      title: "Do you still find it beneficial that leads are pre-qualified by a dedicated team before being allocated to your dealership?",
      options: ["Yes, definitely", "Yes, to some extent", "No, we prefer to manage all leads internally", "Unsure"],
      scores: [4, 3, 1, null],
    },
  ];

  var PREQUAL_BENEFITS = [
    "Higher-quality, sales-ready leads",
    "Reduced time spent contacting unqualified leads",
    "Improved conversion rates",
    "More time for sales staff to focus on selling",
    OTHER,
  ];

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */
  var params = new URLSearchParams(location.search);
  var answers = {
    dealership: "",
    lms: "",
    lms_other: "",
    q4_challenges: [],
    q4_other: "",
    q7_benefit: "",
    q7_benefit_other: "",
    q7_reason_no: "",
    popia_consent: false,
  };
  var consentAt = "";

  // Optional prefill from the WhatsApp link, e.g. ?dealer=...&lms=...&ref=...
  if (params.get("dealer") && (CFG.DEALERSHIPS || []).indexOf(params.get("dealer")) > -1) {
    answers.dealership = params.get("dealer");
  }
  if (params.get("lms") && (CFG.LMS_OPTIONS || []).indexOf(params.get("lms")) > -1) {
    answers.lms = params.get("lms");
  }

  // Screens: intro, context (dealer + LMS), the 7 questions, thank-you.
  var screens = [{ type: "intro" }, { type: "context" }]
    .concat(QUESTIONS)
    .concat([{ type: "done" }]);
  var STEP_COUNT = screens.length - 2; // excludes intro and done
  var current = 0;
  var submitting = false;

  var $ = function (id) { return document.getElementById(id); };
  var form = $("survey");
  var screenEl = $("screen");
  var backBtn = $("backBtn");
  var nextBtn = $("nextBtn");
  var errorEl = $("errorMsg");

  var ICON = {
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    check: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  };

  function nowLabel() {
    var d = new Date();
    try {
      var date = d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      var time = d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
      return date + " at " + time;
    } catch (e) { return d.toString(); }
  }

  function introHtml() {
    var email = CFG.PRIVACY_EMAIL || "privacy@mahindra.co.za";
    return (
      '<div class="intro">' +
      '<img class="intro__logo" src="assets/mahindra-logo.png" alt="Mahindra">' +
      '<h1 class="intro__title">Dealer Lead Management System Survey</h1>' +
      '<p class="intro__brand">Mahindra South Africa</p>' +
      '<p class="intro__text">Thank you for taking part. Your feedback on the Lead Management System your dealership uses helps us improve lead handling, training and system support across the dealer network.</p>' +
      '<div class="chip">' + ICON.clock + "<span>" + esc(nowLabel()) + "</span></div>" +
      '<div class="tiles">' +
      '<div class="tile">' + ICON.clock + '<div class="tile__label">Duration</div><div class="tile__value">2-3 minutes</div></div>' +
      '<div class="tile">' + ICON.file + '<div class="tile__label">Questions</div><div class="tile__value">' + QUESTIONS.length + ' short questions</div></div>' +
      "</div>" +
      '<div class="notice">' +
      '<p class="notice__title">' + ICON.shield + "Privacy Notice (POPIA Compliance)</p>" +
      "<p>In accordance with the <strong>Protection of Personal Information Act (POPIA)</strong>, we are committed to protecting your personal information and your right to privacy.</p>" +
      "<h3>What we collect:</h3><ul>" +
      "<li>Your dealership and the Lead Management System it uses</li>" +
      "<li>Your ratings and feedback responses</li>" +
      "<li>Date and time the survey was completed</li>" +
      "<li>Device and browser used to complete the survey</li></ul>" +
      "<h3>How we use your information:</h3><ul>" +
      "<li>To assess and improve the lead management systems and processes used by dealers</li>" +
      "<li>To identify training, support and system enhancement needs</li>" +
      "<li>To generate statistical reports comparing systems and dealerships</li>" +
      "<li>To follow up on issues raised in your feedback</li></ul>" +
      "<h3>Your rights:</h3><ul>" +
      "<li>You may request access to your personal information</li>" +
      "<li>You may request correction or deletion of your information</li>" +
      "<li>You may withdraw consent at any time by contacting us</li></ul>" +
      '<small>For queries about your personal information, contact Mahindra South Africa at<br><a href="mailto:' + esc(email) + '">' + esc(email) + "</a></small>" +
      "</div>" +
      '<label class="consent"><input type="checkbox" name="popia_consent"' + (answers.popia_consent ? " checked" : "") + ">" +
      "<span><strong>Required:</strong> I have read and understand the Privacy Notice. I consent to Mahindra South Africa collecting, processing, and storing my feedback in accordance with POPIA for the purposes described above.</span></label>" +
      "</div>"
    );
  }

  /* ------------------------------------------------------------------ *
   * Rendering helpers
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function selectHtml(name, label, options, value, withOther) {
    var opts = options.slice();
    if (withOther) opts.push(OTHER);
    return (
      '<label class="field"><span class="field__label">' + esc(label) + "</span>" +
      '<span class="select"><select name="' + name + '" id="' + name + '">' +
      '<option value="">Select…</option>' +
      opts.map(function (o) {
        return '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("") +
      "</select></span></label>"
    );
  }

  function optionsHtml(q, inputType) {
    var selected = answers[q.id];
    return (
      '<div class="options" role="' + (inputType === "radio" ? "radiogroup" : "group") + '" aria-labelledby="qtitle">' +
      q.options.map(function (o, i) {
        var checked = inputType === "radio" ? selected === o : (selected || []).indexOf(o) > -1;
        return (
          '<label class="opt">' +
          '<input type="' + inputType + '" name="' + q.id + '" value="' + esc(o) + '"' + (checked ? " checked" : "") + ">" +
          '<span class="opt__box"><span class="opt__key">' + String.fromCharCode(65 + i) + "</span>" +
          '<span class="opt__text">' + esc(o) + "</span></span></label>"
        );
      }).join("") +
      "</div>"
    );
  }

  function otherBox(name, value, show, placeholder) {
    return (
      '<div class="reveal' + (show ? " is-open" : "") + '" data-reveal="' + name + '">' +
      '<input class="input" type="text" maxlength="300" name="' + name + '" placeholder="' +
      esc(placeholder || "Please specify") + '" value="' + esc(value || "") + '"></div>'
    );
  }

  function qHeader(n, q) {
    return (
      '<p class="eyebrow">Question ' + n + " of " + QUESTIONS.length + "</p>" +
      '<h1 class="qtitle" id="qtitle">' + esc(q.title) + "</h1>" +
      (q.hint ? '<p class="hint">' + esc(q.hint) + "</p>" : "")
    );
  }

  function render() {
    var s = screens[current];
    var html = "";
    errorEl.textContent = "";

    if (s.type === "intro") {
      html = introHtml();
    } else if (s.type === "context") {
      html =
        '<p class="eyebrow">About you</p>' +
        '<h1 class="qtitle">First, tell us where you work</h1>' +
        selectHtml("dealership", "Dealership", CFG.DEALERSHIPS || [], answers.dealership, false) +
        selectHtml("lms", "Lead Management System currently used", CFG.LMS_OPTIONS || [], answers.lms, true) +
        otherBox("lms_other", answers.lms_other, answers.lms === OTHER, "Name of the system");
    } else if (s.type === "done") {
      html =
        '<div class="done"><div class="done__icon">' + ICON.check + '</div>' +
        '<h1 class="qtitle">Thank you!</h1>' +
        '<p class="lead">Your feedback has been received. It will help Mahindra South Africa improve lead management, training and system support across the dealer network.</p>' +
        '<p class="hint">You can now close this page and return to WhatsApp.</p></div>';
    } else {
      var n = QUESTIONS.indexOf(s) + 1;
      html = qHeader(n, s);
      if (s.type === "single") html += optionsHtml(s, "radio");
      if (s.type === "multi") {
        html += optionsHtml(s, "checkbox");
        html += otherBox("q4_other", answers.q4_other, answers.q4_challenges.indexOf(OTHER) > -1);
      }
      if (s.type === "text") {
        html +=
          '<textarea class="input input--area" name="' + s.id + '" maxlength="1000" rows="5" placeholder="' +
          esc(s.placeholder) + '">' + esc(answers[s.id] || "") + "</textarea>" +
          '<p class="counter"><span id="counter">' + (answers[s.id] || "").length + "</span>/1000</p>";
      }
      if (s.id === "q7_prequalification") {
        var a = answers.q7_prequalification || "";
        html +=
          '<div class="reveal followup' + (a.indexOf("Yes") === 0 ? " is-open" : "") + '" data-reveal="q7_yes">' +
          selectHtml("q7_benefit", "What would be the biggest benefit of having pre-qualified leads allocated to your dealership?", PREQUAL_BENEFITS.slice(0, -1), answers.q7_benefit, true) +
          otherBox("q7_benefit_other", answers.q7_benefit_other, answers.q7_benefit === OTHER) +
          "</div>" +
          '<div class="reveal followup' + (a.indexOf("No") === 0 ? " is-open" : "") + '" data-reveal="q7_no">' +
          '<label class="field"><span class="field__label">Why not?</span>' +
          '<textarea class="input input--area" name="q7_reason_no" maxlength="1000" rows="3" placeholder="Type your answer…">' +
          esc(answers.q7_reason_no) + "</textarea></label></div>";
      }
    }

    screenEl.innerHTML = html;
    screenEl.classList.remove("enter");
    void screenEl.offsetWidth; // restart animation
    screenEl.classList.add("enter");

    // Nav + progress
    backBtn.hidden = current === 0 || s.type === "done";
    nextBtn.hidden = s.type === "done";
    nextBtn.textContent =
      s.type === "intro" ? "Start Survey" : current === screens.length - 2 ? "Submit" : "Next";

    $("progressWrap").hidden = s.type === "intro" || s.type === "done";
    $("finePrint").textContent = s.type === "intro" ? "By proceeding, you confirm that you work at a Mahindra dealership." : "";

    var step = Math.min(Math.max(current, 0), STEP_COUNT);
    $("progressBar").style.width = (s.type === "done" ? 100 : (step / STEP_COUNT) * 100) + "%";
    $("progressLabel").textContent =
      s.type === "intro" || s.type === "done" ? "" : "Step " + step + " of " + STEP_COUNT;

    if (current > 0) screenEl.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------------ *
   * Input handling
   * ------------------------------------------------------------------ */
  function toggleReveal(key, open) {
    var el = screenEl.querySelector('[data-reveal="' + key + '"]');
    if (el) el.classList.toggle("is-open", open);
  }

  // Text fields update on every keystroke; choices and selects on change.
  form.addEventListener("input", function (e) {
    if (e.target.type === "text" || e.target.tagName === "TEXTAREA") onChange(e.target);
  });
  form.addEventListener("change", function (e) {
    if (e.target.type !== "text" && e.target.tagName !== "TEXTAREA") onChange(e.target);
  });

  function onChange(t) {
    var name = t.name;
    if (!name) return;
    errorEl.textContent = "";

    if (name === "popia_consent") {
      answers.popia_consent = t.checked;
      consentAt = t.checked ? new Date().toISOString() : "";
      return;
    }

    if (t.type === "checkbox") {
      var q = QUESTIONS.filter(function (x) { return x.id === name; })[0];
      var list = answers[name];
      if (t.checked) {
        if (q.exclusive && t.value === q.exclusive) list.length = 0;
        else if (q.exclusive) list = list.filter(function (v) { return v !== q.exclusive; });
        if (list.indexOf(t.value) < 0) list.push(t.value);
      } else {
        list = list.filter(function (v) { return v !== t.value; });
      }
      answers[name] = list;
      screenEl.querySelectorAll('input[name="' + name + '"]').forEach(function (cb) {
        cb.checked = list.indexOf(cb.value) > -1;
      });
      toggleReveal("q4_other", list.indexOf(OTHER) > -1);
      return;
    }

    answers[name] = t.value;

    if (name === "lms") toggleReveal("lms_other", t.value === OTHER);
    if (name === "q7_benefit") toggleReveal("q7_benefit_other", t.value === OTHER);
    if (name === "q7_prequalification") {
      toggleReveal("q7_yes", t.value.indexOf("Yes") === 0);
      toggleReveal("q7_no", t.value.indexOf("No") === 0);
    }
    if (name === "q6_improvement") $("counter").textContent = t.value.length;

    // Auto-advance on single-choice questions without follow-ups (feels like WhatsApp quick replies)
    if (t.type === "radio" && name !== "q7_prequalification") {
      setTimeout(function () { if (screens[current].id === name) go(1); }, 280);
    }
  }

  function validate() {
    var s = screens[current];
    if (s.type === "intro" && !answers.popia_consent) return "Please accept the Privacy Notice to start the survey.";
    var trim = function (v) { return (v || "").trim(); };
    if (s.type === "context") {
      if (!answers.dealership) return "Please select your dealership.";
      if (!answers.lms) return "Please select the Lead Management System you use.";
      if (answers.lms === OTHER && !trim(answers.lms_other)) return "Please name the system you use.";
    }
    if (s.type === "single" && !answers[s.id]) return "Please choose an option to continue.";
    if (s.type === "multi") {
      if (!answers[s.id].length) return "Please select at least one option.";
      if (answers[s.id].indexOf(OTHER) > -1 && !trim(answers.q4_other)) return "Please describe the other challenge.";
    }
    if (s.type === "text" && trim(answers[s.id]).length < 2) return "Please share a short answer to continue.";
    if (s.id === "q7_prequalification") {
      var a = answers.q7_prequalification;
      if (a.indexOf("Yes") === 0) {
        if (!answers.q7_benefit) return "Please select the biggest benefit.";
        if (answers.q7_benefit === OTHER && !trim(answers.q7_benefit_other)) return "Please describe the other benefit.";
      }
      if (a.indexOf("No") === 0 && !trim(answers.q7_reason_no)) return "Please tell us why.";
    }
    return "";
  }

  function go(dir) {
    if (dir > 0) {
      var err = validate();
      if (err) { errorEl.textContent = err; return; }
      if (current === screens.length - 2) return submit();
    }
    current = Math.max(0, Math.min(screens.length - 1, current + dir));
    render();
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); go(1); });
  backBtn.addEventListener("click", function () { go(-1); });

  /* ------------------------------------------------------------------ *
   * Submission — one flat record per response, ready for a spreadsheet
   * ------------------------------------------------------------------ */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }

  function scoreOf(id) {
    var q = QUESTIONS.filter(function (x) { return x.id === id; })[0];
    var i = q.options.indexOf(answers[id]);
    return i > -1 && q.scores[i] != null ? q.scores[i] : "";
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "r-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function buildRecord() {
    var yes = answers.q7_prequalification.indexOf("Yes") === 0;
    var no = answers.q7_prequalification.indexOf("No") === 0;
    var rec = {
      response_id: uuid(),
      survey_id: CFG.SURVEY_ID || "",
      submitted_at: new Date().toISOString(),
      dealership: answers.dealership,
      lms: answers.lms === OTHER ? "Other: " + answers.lms_other.trim() : answers.lms,
      q1_ease_of_use: answers.q1_ease_of_use,
      q1_score: scoreOf("q1_ease_of_use"),
      q2_functionality: answers.q2_functionality,
      q2_score: scoreOf("q2_functionality"),
      q3_lead_tracking: answers.q3_lead_tracking,
      q3_score: scoreOf("q3_lead_tracking"),
      q4_challenges: answers.q4_challenges.join("; "),
      q4_other_text: answers.q4_challenges.indexOf(OTHER) > -1 ? answers.q4_other.trim() : "",
    };
    // One 0/1 column per challenge so they can be counted / pivoted directly.
    QUESTIONS[3].options.forEach(function (o) {
      rec["q4_" + slug(o)] = answers.q4_challenges.indexOf(o) > -1 ? 1 : 0;
    });
    rec.q5_reporting_confidence = answers.q5_reporting_confidence;
    rec.q5_score = scoreOf("q5_reporting_confidence");
    rec.q6_improvement = answers.q6_improvement.trim();
    rec.q7_prequalification = answers.q7_prequalification;
    rec.q7_score = scoreOf("q7_prequalification");
    rec.q7_benefit = yes ? answers.q7_benefit : "";
    rec.q7_benefit_other = yes && answers.q7_benefit === OTHER ? answers.q7_benefit_other.trim() : "";
    rec.q7_reason_no = no ? answers.q7_reason_no.trim() : "";
    // Tracking fields passed through the WhatsApp link (optional).
    rec.popia_consent = answers.popia_consent ? "Yes" : "No";
    rec.popia_consent_at = consentAt;
    rec.ref = params.get("ref") || "";
    rec.phone = params.get("phone") || params.get("wa") || "";
    rec.user_agent = navigator.userAgent;
    return rec;
  }

  function storeLocally(rec) {
    try {
      var k = "lms_survey_responses";
      var all = JSON.parse(localStorage.getItem(k) || "[]");
      all.push(rec);
      localStorage.setItem(k, JSON.stringify(all));
    } catch (e) { /* storage unavailable */ }
  }

  function submit() {
    if (submitting) return;
    submitting = true;
    nextBtn.disabled = true;
    nextBtn.textContent = "Submitting…";
    var rec = buildRecord();

    var done = function () {
      submitting = false;
      nextBtn.disabled = false;
      current = screens.length - 1;
      render();
    };

    if (!CFG.SUBMIT_URL) {
      console.info("[survey] Demo mode — no SUBMIT_URL configured. Response:", rec);
      storeLocally(rec);
      return done();
    }

    // text/plain avoids a CORS preflight (required for Google Apps Script web apps).
    fetch(CFG.SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(rec),
      redirect: "follow",
    })
      .then(function (r) {
        if (!r.ok && r.type !== "opaque") throw new Error("HTTP " + r.status);
        done();
      })
      .catch(function (err) {
        console.error("[survey] submit failed", err);
        submitting = false;
        nextBtn.disabled = false;
        nextBtn.textContent = "Try again";
        errorEl.textContent = "We couldn't send your response. Please check your connection and tap “Try again”.";
      });
  }

  $("year").textContent = new Date().getFullYear();
  render();
})();
