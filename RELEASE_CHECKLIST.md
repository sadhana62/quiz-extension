# Release Checklist

## Before Upload

- Replace the placeholder contact email in `privacy-policy.html`.
- Host `privacy-policy.html` at a public URL.
- Load the unpacked extension in Chrome or Edge and verify:
  - the options page saves a Gemini API key
  - the helper button appears on multiple-choice Google Forms questions
  - clicking the button returns an explanation
- Take store screenshots of:
  - the options page
  - the helper button on a Google Form
  - the generated explanation panel

## Package

- Upload `google-forms-study-helper-v1.0.0.zip` to the store dashboard.
- If you make more code changes, rebuild the zip before submitting.

## Chrome Web Store Listing

- Add the extension name and short description from `README.md`.
- Paste your hosted privacy policy URL into the privacy policy field.
- Complete the privacy disclosures to match the current code:
  - user-provided Gemini API key
  - question text and answer options sent to Google's Gemini API when the user clicks the button
  - data stored in browser extension storage

## Edge Add-ons

- Reuse the same zip package.
- Reuse the same privacy policy URL and screenshots where applicable.
