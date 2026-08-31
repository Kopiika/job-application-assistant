# TODO

## Cover Letter — formatting & output quality

- [ ] Structured output: greeting (Dear Hiring Manager / Dear [Name]),
      opening paragraph, body, closing, signature block
- [ ] DOCX styling: font, margins, header with contact info,
      date, company address block — зараз plain text
- [ ] Cover letter preview in UI before download (read-only rendered view)
- [ ] Tone selector: formal / conversational / confident
- [ ] Language selector: English / Ukrainian / German etc.
- [ ] "Regenerate section" — перегенерувати тільки один параграф без повного rerun

## CV / Resume

- [ ] Multiple CV style templates in DOCX export
      (classic one-column / modern two-column / minimalist)
- [ ] CV preview in UI (rendered, not raw text)
- [ ] ATS-friendly mode — stripped styling, plain headings, no tables
- [ ] Skills reorder drag-and-drop in Profile tab
- [ ] Gap analysis: highlight missing keywords from JD that aren't in CV

## Tracker

- [ ] Export tracker to CSV / XLSX
- [ ] Deadline/follow-up date field + reminder indicator
- [ ] Kanban view (drag cards between statuses)

## Auth & data

- [ ] Migrate profile + tracker from localStorage to Supabase
      (зараз дані зникають якщо очистити браузер)
- [ ] Multi-device sync після міграції на Supabase

## Nice to have

- [ ] Job description auto-fetch by URL (paste link → scrape text)
- [ ] Interview prep tab: generates likely questions based on JD + CV
- [ ] Email follow-up generator