export interface PromptInput {
  jobDescription: string
  baseCV: string
  candidateName?: string
  language?: 'English' | 'Finnish'
}

export function buildGeneratePrompt(input: PromptInput): string {
  const { jobDescription, baseCV, candidateName = 'the candidate', language = 'English' } = input

  return `You are an expert career coach. Generate ONLY the parts of the candidate's CV that change per job application. Do NOT rewrite or modify work experience, education, or project descriptions — only reorder and tailor the dynamic sections.

CANDIDATE NAME: ${candidateName}
LANGUAGE: ${language}

---
CANDIDATE'S BASE CV:
${baseCV}

---
JOB DESCRIPTION:
${jobDescription}

---
INSTRUCTIONS:

1. POSITION — The job title that best matches both the candidate's background and this specific role.
   - Use a natural variation of their current/target role
   - Never invent a title they clearly have not held

2. SUMMARY — Exactly 3 sentences in ${language}, written in first person ("I am...", "I built...", "I bring...").
   - Sentence 1: who the candidate is and their core skill area
   - Sentence 2: most relevant concrete achievement or experience for THIS role
   - Sentence 3: what specifically they bring to this company/role
   - No clichés: no "passionate", "hardworking", "team player"

3. SKILLS — Reorder the candidate's existing skills so the most relevant ones appear first.
   - Do not add skills the candidate does not have
   - You may append "Currently learning: X" ONLY if X appears in the job description and is plausible given the candidate's profile
   - Preserve the original formatting style (comma-separated or grouped)

4. PROJECTS ORDER — List the exact project names from the base CV in order of relevance to this job (most relevant first).
   - Use the EXACT project names as they appear in the base CV
   - Include ALL projects

5. COVER LETTER — 150 to 200 words in ${language}.
   - Do NOT start with "My name is" or "I am writing to apply"
   - Open with a specific hook about the role or company
   - Paragraph 1: why this role / company specifically
   - Paragraph 2: 2-3 concrete achievements from the CV matching the job
   - Paragraph 3: one-sentence call to action
   - Confident tone, no clichés

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no backticks, no explanation.
{
  "position": "...",
  "summary": "...",
  "skills": "...",
  "projectsOrder": ["Exact Project Name 1", "Exact Project Name 2"],
  "coverLetter": "..."
}`
}

export function buildCVSummaryPrompt(input: PromptInput): string {
  const { jobDescription, baseCV, candidateName = 'the candidate', language = 'English' } = input

  return `You are an expert career coach. Generate ONLY the parts of the candidate's CV that change per job application.

CANDIDATE NAME: ${candidateName}
LANGUAGE: ${language}

---
CANDIDATE'S BASE CV:
${baseCV}

---
JOB DESCRIPTION:
${jobDescription}

---
INSTRUCTIONS:

1. POSITION — Best-fit job title for this role given the candidate's background.
2. SUMMARY — Exactly 3 sentences in first person ("I am...", "I built...", "I bring..."): who they are, key achievement relevant to this job, what they bring.
3. SKILLS — Reorder existing skills most-relevant-first. May append "Currently learning: X" only if X is in the job description.
4. PROJECTS ORDER — All project names from base CV in order of relevance (most relevant first). Use EXACT names.

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no backticks.
{
  "position": "...",
  "summary": "...",
  "skills": "...",
  "projectsOrder": ["Exact Project Name 1", "Exact Project Name 2"]
}`
}

// Окремий промпт тільки для cover letter
export function buildCoverLetterPrompt(input: PromptInput): string {
  const { jobDescription, baseCV, candidateName = 'the candidate', language = 'English' } = input

  return `You are an expert career coach. Write a cover letter in ${language} for ${candidateName}.

Rules:
- 150 to 200 words max
- Do NOT start with "My name is" or "I am writing to apply"
- Open with something specific about the role or company
- Paragraph 1: why this role / company
- Paragraph 2: 2-3 relevant achievements from the CV that match the job
- Paragraph 3: short call to action
- No clichés: no "team player", "passionate", "hardworking"
- Confident, human tone

BASE CV:
${baseCV}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the cover letter text. No subject line, no "Dear Hiring Manager" unless it fits naturally.`
}

// Промпт для аналізу gaps між вакансією і CV
export function buildGapAnalysisPrompt(input: PromptInput): string {
  const { jobDescription, baseCV, language = 'English' } = input

  return `Analyze the job requirements against the candidate's CV. Respond in ${language}.

BASE CV:
${baseCV}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY a valid JSON object. No markdown, no backticks.
Format:
{
  "strongMatches": ["skill or experience that matches", "..."],
  "gaps": ["missing skill or experience", "..."],
  "recommendations": ["specific action to address gap", "..."],
  "overallFit": "strong | moderate | weak",
  "applyAdvice": "one sentence: should they apply and why"
}`
}
