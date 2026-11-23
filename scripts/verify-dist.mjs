import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const base = '/kids-coloring-studio/'
const html = readFileSync('dist/index.html', 'utf8')
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'))
for (const key of ['id', 'start_url', 'scope']) assert.equal(manifest[key], base)
assert.equal(manifest.display, 'standalone')

const files = JSON.parse(readFileSync('dist/sw.js', 'utf8').match(/^const FILES = (.+)$/m)[1])
const cached = new Set(files)
assert.equal(cached.size, files.length)
for (const file of files) {
  const url = new URL(file, 'https://example.com' + base)
  assert.ok(url.pathname.startsWith(base))
  if (file !== './') readFileSync(join('dist', url.pathname.slice(base.length)))
}
assert.ok(cached.has('./'))
assert.ok(cached.has('./index.html'))
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  assert.ok(url.startsWith(base), url)
  assert.ok(cached.has('./' + url.slice(base.length)), url)
}
for (const icon of manifest.icons) {
  assert.ok(cached.has('./' + icon.src))
  const png = readFileSync(join('dist', icon.src))
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes)
}
for (const name of readdirSync('src/games/coloring/data/scenes')) {
  const scene = JSON.parse(readFileSync(join('src/games/coloring/data/scenes', name), 'utf8'))
  assert.ok(cached.has('./' + scene.backgroundImage), scene.backgroundImage)
  assert.deepEqual(readFileSync(join('dist', scene.backgroundImage)), readFileSync(join('public', scene.backgroundImage)))
}
console.log('Pages 경로, manifest, 아이콘 및 서비스 워커 사전 캐시 확인 완료')
