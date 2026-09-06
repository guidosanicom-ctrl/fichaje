import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const src = 'C:/Users/Guido/Downloads/waco.jpg'
const publicDir = join(import.meta.dirname, '..', 'public')

mkdirSync(publicDir, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-16.png', size: 16 },
]

for (const { file, size } of targets) {
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(join(publicDir, file))
  console.log('generated', file)
}

// Maskable icon: logo already has flush background color, just needs to fill 512 with a bit
// of extra breathing room so the safe-zone circle doesn't clip the pennant/text.
const maskableSize = 512
const inner = Math.round(maskableSize * 0.82)
await sharp(src)
  .resize(inner, inner, { fit: 'cover' })
  .extend({
    top: Math.round((maskableSize - inner) / 2),
    bottom: Math.round((maskableSize - inner) / 2),
    left: Math.round((maskableSize - inner) / 2),
    right: Math.round((maskableSize - inner) / 2),
    background: '#23282b',
  })
  .png()
  .toFile(join(publicDir, 'icon-maskable-512.png'))
console.log('generated icon-maskable-512.png')

// Hero logo for in-app header (bigger, kept square, same bg so it blends with the page)
await sharp(src).resize(360, 360, { fit: 'cover' }).png().toFile(join(publicDir, 'waco-logo.png'))
console.log('generated waco-logo.png')
