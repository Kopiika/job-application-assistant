'use client'

import { useState } from 'react'
import CVForm from '@/components/CVForm'

export default function Home() {
  const [baseCV, setBaseCV] = useState('')

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-zinc-800">Job Application Assistant</h1>
        <CVForm onChange={setBaseCV} />
        <p className="mt-4 text-xs text-zinc-400">CV length: {baseCV.length} chars</p>
      </div>
    </div>
  )
}
