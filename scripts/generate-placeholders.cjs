// scripts/generate-placeholders.cjs
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '..')
const OUT_SVG_DIR = path.join(ROOT, 'public', 'uploads')
const OUT_PNG_DIR = path.join(ROOT, 'public', 'uploads', 'png')

const argv = process.argv.slice(2)
function getArg(name) {
  const idx = argv.findIndex((a) => a === name)
  if (idx === -1) return null
  return argv[idx + 1] || null
}
const brandColorArg = getArg('--brandColor') || process.env.BRAND_COLOR || '#FF7A59'

const THEMES = {
  light: {
    bg: '#f3f4f6',
    frame: '#e5e7eb',
    accent: '#9ca3af',
    text: '#374151',
  },
  dark: {
    bg: '#0f1724',
    frame: '#111827',
    accent: '#374151',
    text: '#9ca3af',
  },
  brand: {
    bg: '#ffffff',
    frame: '#FFEDE6',
    accent: brandColorArg,
    text: brandColorArg,
  },
}

const TEMPLATES = [
  { name: 'placeholder', w: 800, h: 600, kind: 'generic' },
  { name: 'placeholder-square', w: 600, h: 600, kind: 'square' },
  { name: 'placeholder-portrait', w: 600, h: 800, kind: 'portrait' },
  { name: 'placeholder-wide', w: 1000, h: 450, kind: 'wide' },
]

function svgFor(template, theme) {
  const { w, h, name } = template
  const { bg, frame, text, accent } = theme
  const centerX = Math.round(w / 2)
  const centerY = Math.round(h / 2.8)
  const circleR = Math.round(Math.min(w, h) / 6)

  // Basic, readable SVG template
  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Placeholder image">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g fill="${frame}" opacity="0.9">
    <rect x="${Math.round(w*0.275)}" y="${Math.round(h*0.2)}" width="${Math.round(w*0.45)}" height="${Math.round(h*0.6)}" rx="${Math.round(Math.min(w,h)/60)}"/>
  </g>
  <g>
    <circle cx="${centerX}" cy="${centerY}" r="${circleR}" fill="${accent}" opacity="0.12"/>
  </g>
  <text x="50%" y="${Math.round(h*0.45)}" text-anchor="middle" font-size="${Math.round(Math.min(w,h)/24)}" fill="${text}" font-family="Inter, Arial, sans-serif">${name.replace('placeholder','').trim() ? name : 'Image not available'}</text>
</svg>`
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function writeFiles() {
  ensureDirSync(OUT_SVG_DIR)
  ensureDirSync(OUT_PNG_DIR)

  for (const [themeName, theme] of Object.entries(THEMES)) {
    const themeSvgDir = path.join(OUT_SVG_DIR, themeName)
    const themePngDir = path.join(OUT_PNG_DIR, themeName)
    ensureDirSync(themeSvgDir)
    ensureDirSync(themePngDir)

    for (const template of TEMPLATES) {
      const svg = svgFor(template, theme)
      const baseName = `${template.name}-${themeName}.svg`
      const svgPath = path.join(themeSvgDir, baseName)
      fs.writeFileSync(svgPath, svg, 'utf8')
      console.log('WROTE', svgPath)

      // Produce PNGs at 1x and 2x scales using sharp
      const png1Path = path.join(themePngDir, `${template.name}-${themeName}.png`)
      const png2Path = path.join(themePngDir, `${template.name}-${themeName}@2x.png`)

      // 1x
      await sharp(Buffer.from(svg)).png().toFile(png1Path)
      console.log('WROTE', png1Path)
      // 2x (retina)
      await sharp(Buffer.from(svg)).png().resize({ width: template.w * 2, height: template.h * 2 }).toFile(png2Path)
      console.log('WROTE', png2Path)
    }
  }

  console.log('\nDone. Files written under:')
  console.log(' SVGs:', OUT_SVG_DIR)
  console.log(' PNGs:', OUT_PNG_DIR)
  console.log('\nExample: public/uploads/light/placeholder-light.svg and public/uploads/png/light/placeholder-light.png')
}

writeFiles().catch((e) => {
  console.error('generate-placeholders: error', e)
  process.exit(1)
})
