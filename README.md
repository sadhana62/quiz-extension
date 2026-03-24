# Google Forms Study Helper Web App

This project is now a Vercel-friendly web app that:

- accepts a public Google Form URL
- accepts a user-provided Gemini API key
- fetches the form through a serverless API route to avoid browser CORS issues
- extracts multiple-choice questions from the Google Form markup
- returns study-oriented Gemini analysis for each question and option

## Files

- `index.html`: main web app page
- `app.css`: web app styles
- `app.js`: client-side form loading and analysis flow
- `api/fetch-form.js`: Vercel serverless route that fetches the Google Form HTML
- `api/analyze-form.js`: Vercel serverless route that calls Gemini
- `privacy-policy.html`: public privacy policy page

## Run on Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Deploy with the default settings.
4. Open the deployed site URL.

## Notes

- The form must be publicly accessible.
- The current parser is tuned for Google Forms multiple-choice questions and may need updates if Google changes their markup.
- The app is designed for studying and explanation, not hidden-answer extraction.
- Legacy extension files are still present in the repo, but the deployed web app uses `index.html`, `app.js`, `app.css`, and the `api/` routes.
