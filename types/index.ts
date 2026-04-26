export interface GenerateRequest {
  jobDescription: string
  baseCV: string
}

export interface GenerateResponse {
  cvSummary: string
  coverLetter: string
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
