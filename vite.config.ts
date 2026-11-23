import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { drawings } from './src/games/coloring/data/drawings'

const base = '/kids-coloring-studio/'

function offline(): Plugin {
  return {
    name: 'coloring-studio-offline',
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const publicFiles = [
          'manifest.webmanifest',
          'icons/studio-192.png',
          'icons/studio-512.png',
          'icons/studio-maskable-512.png',
          ...Object.values(drawings).flatMap(drawing =>
            drawing.backgroundImage && !drawing.backgroundImage.startsWith('data:') ? [drawing.backgroundImage] : [],
          ),
        ]
        const files = [...new Set(['./', ...Object.keys(bundle).map(file => './' + file), ...publicFiles.map(file => './' + file)])]
        const worker = readFileSync('scripts/service-worker.js', 'utf8')
        const hash = createHash('sha256').update(worker).update(JSON.stringify(files))
        for (const file of publicFiles) hash.update(readFileSync('public/' + file))
        for (const item of Object.values(bundle)) hash.update(item.type === 'chunk' ? item.code : item.source)

        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: `const FILES = ${JSON.stringify(files)}
const VERSION = ${JSON.stringify(hash.digest('hex').slice(0, 16))}
${worker}`,
        })
      },
    },
  }
}

export default defineConfig({ base, plugins: [react(), offline()] })
