# AshArrow BHMS

A free, mobile-first BHMS exam-preparation workspace built with HTML, CSS, vanilla JavaScript and JSON. No account or paid hosting is required.

## Run locally
Because the app loads JSON with `fetch`, serve the project over HTTP rather than opening `index.html` directly.

```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy to GitHub Pages
1. Create a repository and upload the contents of this folder.
2. In repository Settings → Pages, choose deploy from the `main` branch and `/ (root)`.
3. This is a root-path static app and does not require a build step.

## Features
- Responsive dashboard and mobile navigation
- Searchable subject library with year/category filters and revision checklist
- Subject detail pages with official curriculum source links and explicit topic-data limitations
- Optional Gemini answer generation using a personal key and configurable model
- Editable AI answer drafts, copy and regenerate
- Personal question bank with practiced/difficult flags and JSON export/import
- Separate PYQ area with JSON import validation; starts empty rather than inventing verified questions
- Versioned browser-local state, revision tracking, recently opened subjects, backup/restore
- University directory starter including MUHS
- Curriculum and source-information page

## AI key safety
The Gemini API key is entered by the user. A browser-only static app cannot keep an API key secret: it is exposed to the browser while in use. Saving it in localStorage is optional and not secure credential storage. Do not use a shared/private key or save it on a shared device. For centrally funded AI access, use a backend/serverless proxy with authentication, quotas, abuse protection and secrets stored in environment variables. The public repository must never contain a private key.

## Curriculum data quality
The subject starter list is based on NCH Competency Based Dynamic Curriculum pages:
- https://nch.org.in/cbdc
- https://nch.org.in/first-bhms
- https://nch.org.in/second-bhms
- https://nch.org.in/Third-bhms
- https://nch.org.in/fourth-bhms
- https://nch.org.in/nch-gazetted-rules-and-regulations

NCH lists the BHMS Regulations 2022 and a BHMS amendment dated 3 January 2025. Student applicability can depend on admission cohort and university implementation. This project is a source-linked starter dataset, not a claim that every batch, topic, university paper scheme or amendment has been fully reconciled. Topic arrays are intentionally empty until verified topic-level data is imported. The research-methodology subject is flagged for placement review. Confirm current applicability with official NCH and university documents.

MUHS is included as a university to investigate, but no current cohort-specific exam scheme is asserted as verified.

## PYQ verification
`data/pyqs.json` is intentionally empty. Import only questions from identifiable papers and preserve source metadata. Imported source metadata is not equivalent to independent verification; review sources before labeling a question verified.

## Local storage
Revision and personal question data remain in the current browser profile and do not synchronize across devices. Export backups periodically. The app gracefully handles storage failures, though persistent data may be unavailable when browser storage is blocked.

## License
MIT — see `LICENSE`.
