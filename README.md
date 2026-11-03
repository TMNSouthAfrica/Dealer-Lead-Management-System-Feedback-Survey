# Dealer Lead Management System Feedback Survey

Mobile-first landing page survey for Mahindra South Africa dealerships, built from the
*Dealer Lead Management System Feedback Survey* brief. It is designed to be opened from a
WhatsApp link and completed in 2–3 minutes.

The look follows Mahindra South Africa's existing Test Drive Experience Survey: red header bar
with logo, white card, Inter font, primary red `#E31837`, a POPIA privacy notice and a required
consent checkbox on the landing screen.

No build step or framework: plain HTML, CSS and JavaScript. Host the folder on any static
host (GitHub Pages, Netlify, Vercel, S3, an existing web server).

## Survey flow

| Step | Content | Type |
|------|---------|------|
| Intro | Logo, purpose, date, duration and question count, POPIA notice | Required consent checkbox |
| About you | Dealership, LMS currently used (+ "Other" box) | Drop-downs |
| Q1 | How easy do you find the LMS to use? | 5-point scale |
| Q2 | Does the system provide all the functionality you need? | 4-point scale |
| Q3 | How effectively does it track leads from allocation to outcome? | 5-point scale |
| Q4 | Biggest challenges | Multi-select (+ "Other" box; "No significant challenges" is exclusive) |
| Q5 | Confidence in accurate tracking and conversion reporting | 5-point scale |
| Q6 | One improvement that would make the system more effective | Open text |
| Q7 | Is pre-qualification of leads still beneficial? | Single choice, with branching |
| ↳ if **Yes** | Biggest benefit of pre-qualified leads | Drop-down (+ "Other" box) |
| ↳ if **No** | Why? | Open text |

Single-choice answers auto-advance, like tapping a WhatsApp quick reply. Every answer is
required, and the respondent can go back to change it.

## Configuration (`config.js`)

- `DEALERSHIPS`: the 104 dealerships from the Mahindra store locator list (`Mahindra_Store_Locator_Info.xlsx`). The page adds a search box above the drop-down.
- `LMS_OPTIONS`: **replace the placeholders** with the systems in use. "Other" is added automatically.
- `PRIVACY_EMAIL`: contact shown in the privacy notice (default `privacy@mahindra.co.za`).
- `SUBMIT_URL`: the endpoint that receives responses. When it is empty the page runs in demo
  mode: the response is logged to the browser console and kept in `localStorage`.

## Capturing responses

Each submission is sent as one flat JSON object (one spreadsheet row), so results can be
compared across systems and dealerships:

- `dealership`, `lms`
- `q1_ease_of_use` + `q1_score` (5 = best), likewise `q2`, `q3`, `q5` and `q7`
  (Q7 "Unsure" has no score)
- `q4_challenges` (semicolon list), `q4_other_text`, and one 0/1 column per challenge
  (`q4_difficult_to_navigate`, `q4_slow_performance_or_technical_issues`, …) for easy counting
- `q6_improvement`, `q7_benefit`, `q7_benefit_other`, `q7_reason_no`
- `popia_consent` (Yes), `popia_consent_at` (timestamp)
- `response_id`, `submitted_at`, `survey_id`, `ref`, `phone`, `user_agent`

### Google Sheets (recommended)

1. Create a Google Sheet, then go to **Extensions → Apps Script** and paste `google-apps-script/Code.gs`.
2. Go to **Deploy → New deployment → Web app**, set *Execute as: Me* and *Who has access: Anyone*.
3. Paste the `/exec` URL into `SUBMIT_URL`.

Any other webhook that accepts a POST with a JSON body (Pabbly Connect, Zapier, Make, a CRM)
also works. The body is sent as `text/plain` so the browser skips a CORS preflight.

## WhatsApp link parameters (optional)

```
https://your-host/survey/?dealer=Mahindra%20Polokwane&lms=LMS%201&ref=wave1&phone=27821234567
```

- `dealer` / `lms`: pre-select the drop-downs. They must exactly match an entry in `config.js`.
- `ref`, `phone` (or `wa`): passed through to the response for tracking and de-duplication.

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploying to Vercel

1. In Vercel go to **Add New… → Project** and import this GitHub repository.
2. Framework preset: **Other**. Leave the build command and output directory empty (it's a static site).
3. Click **Deploy**. Every push to the production branch redeploys automatically; other branches get preview URLs.

`vercel.json` turns off search indexing and caching of `config.js`/`app.js`, so list and endpoint changes go live immediately.

## Brand assets

`assets/mahindra-logo.png` is a transparent version of the official logo (`Mahindra logo (1).jpg`),
used in the red header bar and on the landing card. To change the logo, replace that PNG and keep
the file name.
