/*
 * Survey configuration — edit this file only; no other code changes needed.
 *
 *  - SUBMIT_URL: where responses are POSTed as JSON. Works with a Google Apps
 *    Script web app (see google-apps-script/Code.gs), Pabbly / Zapier / Make
 *    webhooks, or any endpoint that accepts a POST body.
 *    Leave empty to run in demo mode (responses are logged to the console and
 *    kept in this browser's localStorage only).
 *
 *  - DEALERS_BY_PROVINCE: province and dealership drop-downs (store locator list).
 *  - DESIGNATIONS: designation drop-down ("Other" is added automatically).
 *  - LMS_OPTIONS: lead management system drop-down. Replace the placeholder
 *    entries with the real list before launch.
 */
window.SURVEY_CONFIG = {
  SUBMIT_URL: "",

  SURVEY_ID: "mahindra-dealer-lms-feedback-2026",

  // Negative answers on Q1, Q2, Q3 and Q5 open a comment box.
  // true = a comment is required before continuing; false = optional.
  NEGATIVE_COMMENT_REQUIRED: true,

  // Shown in the POPIA privacy notice (same contact as the Test Drive survey).
  PRIVACY_EMAIL: "privacy@mahindra.co.za",

  // Dealerships grouped by province. Source: Mahindra_Store_Locator_Info.xlsx
  // (104 entries). The spreadsheet has no province column, so provinces were
  // assigned from each dealership's town name; please verify.
  DEALERS_BY_PROVINCE: {
    "Eastern Cape": [
      "Mahindra Burgersdorp",
      "Mahindra Cradock",
      "Mahindra East London",
      "Mahindra Graaff Reinet",
      "Mahindra Humansdorp",
      "Mahindra King Williams Town",
      "Mahindra Mthatha",
      "Mahindra Port Elizabeth",
      "Mahindra Queenstown",
    ],
    "Free State": [
      "Mahindra Bethlehem",
      "Mahindra Bloemfontein",
      "Mahindra Warden",
      "Mahindra Welkom",
      "Mahindra Welkom Service Center",
    ],
    "Gauteng": [
      "Mahindra Alberton",
      "Mahindra Benoni",
      "Mahindra Benoni Service center",
      "Mahindra Bronkhorstspruit",
      "Mahindra Bryanston",
      "Mahindra Centurion",
      "Mahindra Clearwater",
      "Mahindra Eagle",
      "Mahindra East Rand",
      "Mahindra Edenvale",
      "Mahindra Fourways",
      "Mahindra Germiston",
      "Mahindra Glen",
      "Mahindra Hatfield",
      "Mahindra Heidelberg",
      "Mahindra JHB South",
      "Mahindra Kempton Park",
      "Mahindra Lenasia",
      "Mahindra Menlyn",
      "Mahindra Midrand",
      "Mahindra Montana",
      "Mahindra PTA North",
      "Mahindra Randburg/NorthCliff",
      "Mahindra Randfontein",
      "Mahindra Rivonia",
      "Mahindra Silverlakes",
      "Mahindra Silverton",
      "Mahindra Springs (New)",
      "Mahindra Vaal",
      "Mahindra Vereeniging",
      "Mahindra Westrand",
      "Mahindra Woodmead",
    ],
    "KwaZulu-Natal": [
      "Mahindra Amanzimtoti",
      "Mahindra Ballito",
      "Mahindra Durban",
      "Mahindra Empangeni",
      "Mahindra Kokstad",
      "Mahindra Ladysmith",
      "Mahindra Newcastle",
      "Mahindra Pinetown",
      "Mahindra PMB",
      "Mahindra South Coast",
      "Mahindra Umhlanga",
      "Mahindra Vryheid",
    ],
    "Limpopo": [
      "Mahindra Bela Bela",
      "Mahindra Groblersdal",
      "Mahindra Lephalale",
      "Mahindra Louis Trichardt",
      "Mahindra Maruleng",
      "Mahindra Mokopane",
      "Mahindra Polokwane",
      "Mahindra Thabazimbi",
      "Mahindra Tzaneen",
    ],
    "Mpumalanga": [
      "Mahindra Bethal",
      "Mahindra Lydenburg",
      "Mahindra Middelburg",
      "Mahindra Nelspruit",
      "Mahindra Piet Retief",
      "Mahindra Witbank",
    ],
    "North West": [
      "Mahindra Brits",
      "Mahindra Klerksdorp",
      "Mahindra Mahikeng",
      "Mahindra Potchefstroom",
      "Mahindra Rustenburg",
      "Mahindra Vryburg",
    ],
    "Northern Cape": [
      "Mahindra Kathu",
      "Mahindra Kimberley",
      "Mahindra Springbok",
      "Mahindra Upington",
    ],
    "Western Cape": [
      "Mahindra Caledon",
      "Mahindra Cape Metro",
      "Mahindra George",
      "Mahindra Goodwood",
      "Mahindra Hermanus",
      "Mahindra Knysna",
      "Mahindra Kuilsrivier",
      "Mahindra Malmesbury",
      "Mahindra Milnerton",
      "Mahindra Paarl",
      "Mahindra Somerset West",
      "Mahindra Tokai",
      "Mahindra Tygervalley",
      "Mahindra Vredenburg",
      "Mahindra Worcester",
    ],
    "Outside South Africa": [
      "Mahindra Botswana",
      "Mahindra Swaziland",
      "Mahindra Windhoek",
      "Mahindra Zambia",
      "Mahindra Zimbabwe",
      "Mahindra Zimbabwe Croco",
    ],
  },

  // Respondent designation (matches the CRM labels).
  DESIGNATIONS: [
    "Owner",
    "Franchise Director",
    "Dealer Principal",
    "Marketing Manager",
    "Sales Manager",
    "Sales Executive",
    "Fleet Sales Executive",
  ],

  // TODO: replace with the lead management systems in use across the network.
  LMS_OPTIONS: [
    "LMS 1 (placeholder)",
    "LMS 2 (placeholder)",
    "LMS 3 (placeholder)",
  ],
};
