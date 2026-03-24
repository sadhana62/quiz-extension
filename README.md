# Google Forms Study Helper

This is a Manifest V3 Chrome extension starter that:

- stores your Gemini API key in extension settings
- detects multiple-choice questions on Google Forms
- adds an `Explain with AI` button below each radio-question block
- sends the question and options to the Gemini API for a study-oriented explanation

## Publish-readiness

This repository now includes:

- extension icons in `icons/`
- manifest icon wiring for Chrome and Edge stores
- a `privacy-policy.html` file you can host and link from the store listing

Before publishing, replace the placeholder contact details in `privacy-policy.html` with your real support email or website.

## Files

- `manifest.json`: extension manifest
- `background.js`: Gemini API calls
- `content.js`: Google Forms DOM detection and inline UI
- `content.css`: styles for the inline helper
- `options.html`, `options.css`, `options.js`: settings page

## Load the extension

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click `Load unpacked`.
4. Select this folder: `b:\Sadhana\quiz-extension`.
5. Open the extension options and paste your Gemini API key.

## Publish to Chrome Web Store

1. Create a developer account in the Chrome Web Store Developer Dashboard.
2. Zip the contents of this folder.
3. Upload the zip as a new item.
4. Add the store listing details:
   - name: Google Forms Study Helper
   - short description: Adds AI-powered study explanations for multiple-choice questions in Google Forms.
   - privacy policy URL: host `privacy-policy.html` somewhere public and paste that URL into the listing
5. Complete the privacy disclosures:
   - user enters a Gemini API key
   - the extension stores that key with browser storage
   - question text and options are sent to Google's Gemini API when the user clicks the explanation button
6. Add screenshots taken from the running extension on a Google Form.
7. Submit for review.

## Publish to Microsoft Edge Add-ons

1. Create a Microsoft Partner Center developer account.
2. Reuse the same zip package.
3. Reuse the same privacy policy URL and listing copy.
4. Submit the add-on for review.

## Suggested Store Description

Google Forms Study Helper adds an "Explain with AI" button below multiple-choice questions on Google Forms. When you click it, the extension sends the visible question and answer options to Gemini and returns a concise explanation designed for studying, not answer extraction. Your Gemini API key is stored in browser extension storage and used only for requests you trigger.

## Notes

- This starter is intentionally built as a study helper. It explains questions and analyzes options rather than silently auto-answering forms.
- Google Forms markup can change. If a specific form layout is not detected, update the selectors in `content.js`.
- The extension calls the Gemini `generateContent` REST API with your API key and currently uses the `gemini-2.5-flash` model by default.
