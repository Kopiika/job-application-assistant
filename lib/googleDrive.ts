import { google } from 'googleapis'
import { Readable } from 'stream'

export async function uploadToDrive(buffer: Buffer, fileName: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })

  const drive = google.drive({ version: 'v3', auth: oauth2Client })

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: Readable.from(buffer),
    },
    fields: 'id',
  })

  await drive.permissions.create({
    fileId: data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return `https://drive.google.com/file/d/${data.id}/view`
}
