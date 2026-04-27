import { NextRequest, NextResponse } from 'next/server'
import { uploadToDrive } from '@/lib/googleDrive'
import type { DriveUploadResponse } from '@/types'

export async function POST(req: NextRequest) {
  const { fileBase64, fileName } = await req.json()

  if (!fileBase64 || !fileName) {
    return NextResponse.json(
      { error: 'Missing required fields: fileBase64, fileName' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(fileBase64, 'base64')

  let driveLink: string
  try {
    driveLink = await uploadToDrive(buffer, fileName)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Service account quota error: folder must be a Shared Drive, not a personal My Drive folder
    if (message.includes('storage quota')) {
      return NextResponse.json(
        {
          error:
            'Google Drive upload failed: the target folder must be in a Shared Drive. ' +
            'Personal "My Drive" folders do not work with service accounts. ' +
            'Create a Shared Drive folder and share it with the service account email.',
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: `Drive upload failed: ${message}` }, { status: 500 })
  }

  return NextResponse.json({ driveLink, fileName } satisfies DriveUploadResponse)
}
