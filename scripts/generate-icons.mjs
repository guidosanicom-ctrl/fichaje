import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = join(__dirname, 'icon-source.svg')
const publicDir = join(__dirname, '..', 'public')

mkdirSync(publicDir, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(src).resize(size, size).png().toFile(join(publicDir, file))
  console.log('generated', file)
}

// Maskable icon: same art with safe-zone padding (icon content within ~80% center circle)
const maskableSize = 512
const padded = Math.round(maskableSize * 0.7)
await sharp(src)
  .resize(padded, padded)
  .extend({
    top: Math.round((maskableSize - padded) / 2),
    bottom: Math.round((maskableSize - padded) / 2),
    left: Math.round((maskableSize - padded) / 2),
    right: Math.round((maskableSize - padded) / 2),
    background: '#7A4A1E',
  })
  .png()
  .toFile(join(publicDir, 'icon-maskable-512.png'))
console.log('generated icon-maskable-512.png')
