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
| About you | Name & surname (one field), designation (+ "Other" box) | Text field, drop-down |
| Your dealership | Province, then dealership (filtered to that province), LMS currently used | Drop-downs |
| Q1 | How easy do you find the LMS to use? | 5-point scale |
| Q2 | Does the system provide all the functionality you need? | 4-point scale |
| Q3 | How effectively does it track leads from allocation to outcome? | 5-point scale |
| Q4 | Confidence in accurate tracking and conversion reporting | 5-point scale |
| Q5 | Biggest challenges | Multi-select (+ "Other" box; "No significant challenges" is exclusive) |
| Q6 | One improvement that would make the system more effective | Open text |
| Q7 | Is pre-qualification of leads still beneficial? | Single choice, with branching |

Payload field names were kept when Q4 and Q5 swapped places, so existing Pabbly mappings still work:
the confidence question (shown as Q4) is still sent as `q5_reporting_confidence` / `q5_score` /
`q5_comment`, and the challenges question (shown as Q5) as `q4_challenges` / `q4_*`.
| ↳ if **Yes** | Biggest benefit of pre-qualified leads | Drop-down (+ "Other" box) |
| ↳ if **No** | Why? | Open text |

**Negative feedback comments:** a negative answer on Q1 (Difficult / Very difficult),
Q2 (Partially / No), Q3 (Ineffectively / Very ineffectively) or Q4 (Not very confident /
Not confident at all) opens a comment box asking what isn't working. A comment is required by
default; set `NEGATIVE_COMMENT_REQUIRED: false` in `config.js` to make it optional.

Single-choice answers auto-advance, like tapping a WhatsApp quick reply. Every answer is
required, and the respondent can go back to change it.

## Configuration (`config.js`)

- `DEALERS_BY_PROVINCE`: the 104 dealerships from the Mahindra store locator list (`Mahindra_Store_Locator_Info.xlsx`) plus Mahindra Hillcrest (KwaZulu-Natal), grouped by province. The spreadsheet has no province column, so provinces were assigned from each town name. Non-South-African outlets are under "Outside South Africa".
- `DESIGNATIONS`: Owner, Franchise Director, Dealer Principal, Marketing Manager, Sales Manager, Sales Executive, Fleet Sales Executive. "Other" is added automatically.
- `LMS_OPTIONS`: Auto SLM, CMS, Dash, DealersOnline, Easyquote, EGM, Heycarter, Motodata, Pinnacle. This drop-down has no "Other" option.
- `PRIVACY_EMAIL`: contact shown in the privacy notice (default `privacy@mahindra.co.za`).
- `SUBMIT_URL`: the endpoint that receives responses. It is set to the Pabbly Connect webhook.
  When it is empty the page runs in demo mode: the response is logged to the browser console and
  kept in `localStorage`.
- `SUBMIT_FORMAT`: `"form"` (default) sends one URL-encoded field per answer, which Pabbly maps
  as separate fields; `"json"` sends the whole record as a JSON string.

## Capturing responses

Each submission is sent to the Pabbly Connect webhook as one flat record (one spreadsheet row), so results can be
compared across systems and dealerships:

- `name_surname`, `designation`, `province`, `dealership`, `lms`
- `designation_number`: the designation's number, separate from its name: Owner = 0, Franchise Director = 1,
  Dealer Principal = 2, Marketing Manager = 3, Sales Manager = 4, Sales Executive = 5,
  Fleet Sales Executive = 6, Other = 7
- `q1_ease_of_use` + `q1_score` (5 = best), likewise `q2`, `q3`, `q5` and `q7`
  (Q7 "Unsure" has no score)
- `q4_challenges` (semicolon list), `q4_other_text`, and one 0/1 column per challenge
  (`q4_difficult_to_navigate`, `q4_slow_performance_or_technical_issues`, …) for easy counting
- `q1_comment` (Usability), `q2_comment` (System Functionality), `q3_comment` (Lead Tracking),
  `q5_comment` (Reliability): always filled with the selected option, plus the typed comment on a
  negative answer, e.g. `Easy` or `Very difficult - too many clicks`
- `has_negative_feedback` (Yes/No): any negative answer, or "No" on Q7, for easy follow-up filtering
- `q6_improvement`, `q7_benefit`, `q7_benefit_other`, `q7_reason_no`
- `popia_consent` (Yes), `popia_consent_at` (timestamp)
- `app_version`: which release of the page sent the response
- `response_id`, `submitted_at`, `survey_id`, `ref`, `phone`, `user_agent`

### Google Sheets (recommended)

1. Create a Google Sheet, then go to **Extensions → Apps Script** and paste `google-apps-script/Code.gs`.
2. Go to **Deploy → New deployment → Web app**, set *Execute as: Me* and *Who has access: Anyone*.
3. Paste the `/exec` URL into `SUBMIT_URL`.

Any other webhook (Pabbly Connect, Zapier, Make, a CRM) also works. Requests are sent without a
CORS preflight, so the receiving service doesn't need special CORS settings.

## WhatsApp link parameters (optional)

```
https://your-host/survey/?dealer=Mahindra%20Polokwane&lms=Motodata&ref=wave1&phone=27821234567
```

- `dealer` / `lms`: pre-select the drop-downs (`dealer` also selects its province). They must exactly match an entry in `config.js`.
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
