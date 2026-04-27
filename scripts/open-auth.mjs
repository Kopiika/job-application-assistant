import { readFileSync } from 'fs'
import { execSync } from 'child_process'

// Read .env.local manually
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim().replace(/^"|"$/g, '')]
    })
)

const CLIENT_ID = env.GOOGLE_CLIENT_ID
const REDIRECT_URI = 'http://localhost:3000/oauth2callback'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

if (!CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID not found in .env.local')
  process.exit(1)
}

const url =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\nВідкриваю браузер для авторизації Google...')
console.log('\nЯкщо браузер не відкрився, перейди за цим посиланням вручну:')
console.log('\n' + url + '\n')

try {
  execSync(`open "${url}"`)
} catch {
  // open is macOS-specific, fallback already printed above
}
