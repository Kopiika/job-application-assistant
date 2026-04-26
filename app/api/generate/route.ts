import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildGeneratePrompt } from '@/lib/buildPrompt'
import type { GenerateRequest, GenerateResponse } from '@/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { jobDescription, baseCV }: GenerateRequest = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildGeneratePrompt({ jobDescription, baseCV }) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const { cvSummary, coverLetter }: GenerateResponse = JSON.parse(text)

  return NextResponse.json({ cvSummary, coverLetter })
}
