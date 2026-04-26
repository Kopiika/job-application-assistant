export interface PromptInput {
  jobDescription: string
  baseCV: string
  candidateName?: string
  language?: 'English' | 'Finnish'
}

// Повертає промпт який просить Claude згенерувати CV summary + cover letter
// як JSON об'єкт — щоб легко парсити відповідь на бекенді
export function buildGeneratePrompt(input: PromptInput): string {
  const { jobDescription, baseCV, candidateName = 'the candidate', language = 'English' } = input

  return `You are an expert career coach specializing in tech industry applications.

Your task is to analyze the job description and the candidate's CV, then generate two tailored documents.

CANDIDATE NAME: ${candidateName}
LANGUAGE: Write both documents in ${language}.

---
CANDIDATE'S BASE CV:
${baseCV}

---
JOB DESCRIPTION:
${jobDescription}

---
INSTRUCTIONS:

1. CV SUMMARY — 4 to 6 bullet points max.
   - Pick only the most relevant experience and skills for THIS specific job
   - Use keywords from the job description naturally
   - Be concrete — use numbers and results where possible (e.g. "Built admin panel for 1,000 users", "100% Lighthouse score")
   - Do NOT list everything from the CV — only what matches this role

2. COVER LETTER — 150 to 200 words max.
   - Do NOT start with "My name is" or "I am writing to apply"
   - Open with a specific hook — something concrete about the role or company
   - Paragraph 1: why this role / company specifically
   - Paragraph 2: 2-3 most relevant achievements that match the job requirements
   - Paragraph 3: one sentence call to action
   - Confident tone, no clichés like "team player", "passionate", "hardworking"

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no backticks, no explanation.
Use this exact format:
{
  "cvSummary": "• bullet 1\\n• bullet 2\\n• bullet 3\\n• bullet 4",
  "coverLetter": "full cover letter text here as a single string with \\n for paragraph breaks"
}`
}

// Окремий промпт тільки для CV summary (якщо треба regenerate одного документу)
export function buildCVSummaryPrompt(input: PromptInput): string {
  const { jobDescription, baseCV, language = 'English' } = input

  return `You are an expert career coach. Create a tailored CV summary in ${language}.

Rules:
- 4 to 6 bullet points only
- Use keywords from the job description
- Be concrete, use numbers and results
- Only include what is relevant to THIS job

BASE CV:
${baseCV}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the bullet points, one per line, starting each with "•". No extra text.`
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

// Промпт для interview prep
export function buildInterviewPrepPrompt(input: PromptInput): string {
  const { jobDescription, baseCV, language = 'English' } = input

  return `You are an expert interview coach. Based on the job description and candidate's CV, generate the top 8 interview questions likely to be asked, with suggested answers.

Rules:
- Mix of technical and behavioral questions
- Answers should reference specific projects and skills from the CV
- Keep each answer under 100 words
- Language: ${language}

BASE CV:
${baseCV}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY a valid JSON array. No markdown, no backticks.
Format:
[
  { "question": "...", "answer": "..." },
  { "question": "...", "answer": "..." }
]`
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
