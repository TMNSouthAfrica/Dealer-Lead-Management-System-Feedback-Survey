/*
 * Survey configuration — edit this file only; no other code changes needed.
 *
 *  - SUBMIT_URL: where responses are POSTed as JSON. Works with a Google Apps
 *    Script web app (see google-apps-script/Code.gs), Pabbly / Zapier / Make
 *    webhooks, or any endpoint that accepts a POST body.
 *    Leave empty to run in demo mode (responses are logged to the console and
 *    kept in this browser's localStorage only).
 *
 *  - DEALERSHIPS / LMS_OPTIONS: the two drop-downs. Replace the placeholder
 *    entries with the real lists before launch.
 */
window.SURVEY_CONFIG = {
  SUBMIT_URL: "",

  SURVEY_ID: "mahindra-dealer-lms-feedback-2026",

  // TODO: replace with the official Mahindra SA dealer network list.
  DEALERSHIPS: [
    "Dealership 1 (placeholder)",
    "Dealership 2 (placeholder)",
    "Dealership 3 (placeholder)",
  ],

  // TODO: replace with the lead management systems in use across the network.
  LMS_OPTIONS: [
    "LMS 1 (placeholder)",
    "LMS 2 (placeholder)",
    "LMS 3 (placeholder)",
  ],
};
