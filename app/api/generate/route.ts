import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildGeneratePrompt,
  buildCVSummaryPrompt,
  buildCoverLetterPrompt,
} from '@/lib/buildPrompt'
import type { GenerateRequest, TailoredFields } from '@/types'

const client = new Anthropic()

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

export async function POST(req: NextRequest) {
  const {
    jobDescription,
    baseCV,
    generateCV = true,
    generateCover = true,
  }: GenerateRequest = await req.json()

  let tailoredFields: TailoredFields | null = null
  let coverLetter: string | null = null

  if (generateCV && generateCover) {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildGeneratePrompt({ jobDescription, baseCV }) }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(extractJSON(text))
    tailoredFields = {
      position: parsed.position,
      summary: parsed.summary,
      skills: parsed.skills,
      projectsOrder: parsed.projectsOrder ?? [],
    }
    coverLetter = parsed.coverLetter ?? null
  } else if (generateCV) {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 768,
      messages: [{ role: 'user', content: buildCVSummaryPrompt({ jobDescription, baseCV }) }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(extractJSON(text))
    tailoredFields = {
      position: parsed.position,
      summary: parsed.summary,
      skills: parsed.skills,
      projectsOrder: parsed.projectsOrder ?? [],
    }
  } else if (generateCover) {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: buildCoverLetterPrompt({ jobDescription, baseCV }) }],
    })
    coverLetter = message.content[0].type === 'text' ? message.content[0].text : ''
  }

  return NextResponse.json({ tailoredFields, coverLetter })
}
