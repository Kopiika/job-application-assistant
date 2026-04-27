export interface GenerateRequest {
  jobDescription: string
  baseCV: string
  generateCV?: boolean
  generateCover?: boolean
}

export interface TailoredFields {
  position: string
  summary: string
  skills: string
  projectsOrder: string[]
}

export interface GenerateResponse {
  tailoredFields: TailoredFields | null
  coverLetter: string | null
}

export interface DocxRequest {
  cvSummary: string
  coverLetter: string
  candidateName: string
}

export interface DriveUploadResponse {
  driveLink: string
  fileName: string
}

export interface ExperienceEntry {
  title: string
  company: string
  location: string
  from: string
  to: string
  description: string
  bullets: string
  tech: string
}

export interface ProjectEntry {
  name: string
  from: string
  to: string
  description: string
  bullets: string
  tech: string
  githubLink: string
  demoLink: string
}

export interface EducationEntry {
  degree: string
  school: string
  from: string
  to: string
  description: string
}

export interface LanguageEntry {
  language: string
  level: string
}

export interface Profile {
  name: string
  email: string
  linkedin: string
  github: string
  photo?: string
  role: string
  skills: string
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  languages: LanguageEntry[]
  location: string
  about: string
}

export type AppStatus = 'draft' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface Application {
  id: string
  company: string
  role: string
  location: string
  status: AppStatus
  appliedOn: string
  updatedOn: string
  notes: string
  url: string
  cvSummary: string
  coverLetter: string
  starred: boolean
}
