import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'media'
const OUT = 'src/assets'

// Each supplied asset, identified by inspecting its actual content.
const MAP = {
  'logo.jpeg': { name: 'logo', width: 512, fit: 'cover' },
  'Golden Hour Modern Villa Escape.png': { name: 'villa-street-golden-hour', width: 2400 },
  'Gemini_Generated_Image_kq2ssckq2ssckq2s.png': { name: 'content-studio', width: 1920 },
  'k5HdOo5IJjpS47YFEMET4Sqev': { name: 'aerial-boulevard', width: 1920 },
  'nNvrhcnsjB': { name: 'villa-dusk-entrance', width: 1920 },
  'qYcUp6QqFl4gt4wSbwtpfsP83j9': { name: 'campaign-review', width: 1920 },
  'trczm7jpjnVNTucc': { name: 'aerial-plotted-layout', width: 1920 },
}

await mkdir(OUT, { recursive: true })
const files = await readdir(SRC)

for (const file of files) {
  const key = Object.keys(MAP).find(k => file.startsWith(k) || file === k)
  if (!key) { console.log(`skip (unmapped): ${file}`); continue }
  const { name, width } = MAP[key]
  const input = path.join(SRC, file)
  const img = sharp(input).resize({ width, withoutEnlargement: true })
  const meta = await sharp(input).metadata()

  await img.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`))
  await img.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`))
  console.log(`${file}\n  -> ${name}.{webp,jpg}  (source ${meta.width}x${meta.height})`)
}
