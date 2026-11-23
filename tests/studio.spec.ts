import { test, expect } from '@playwright/test'
import { drawings } from '../src/games/coloring/data/drawings'
import { storageKey } from '../src/games/coloring/engine'

const oldPath = '/kids-game-playground/'
const studioPath = '/kids-coloring-studio/'
const expectedIds = ['police-car-robot', 'fire-robot', 'baby-dinosaur', 'garden-butterfly']

test('restores all four legacy keys from the old path on the same origin', async ({ page }) => {
  const records = expectedIds.map(id => ({
    key: 'kids-game-playground:v1:game:coloring:' + id + ':r4',
    history: [drawings[id].regions.find(region => region.colorId === 1)!.id],
  }))
  await page.route('**/kids-game-playground/', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>Legacy origin fixture</title>',
  }))
  await page.goto(oldPath)
  await page.evaluate(records => {
    for (const { key, history } of records)
      localStorage.setItem(key, JSON.stringify({ version: 1, history, updatedAt: '2026-11-17T00:00:00Z' }))
  }, records)
  await page.goto(studioPath)
  for (const [index, id] of expectedIds.entries()) {
    const drawing = drawings[id]
    expect(storageKey(drawing)).toBe(records[index].key)
    await page.getByRole('button', { name: drawing.title + ', ' + drawing.colors.length + '색, 이어서 색칠하기' }).tap()
    await expect(page.locator('[data-painted=true]')).toHaveAttribute('data-region', records[index].history[0])
    await page.getByRole('button', { name: '도안 선택' }).tap()
  }
  await page.reload()
  await expect(page.getByRole('button', { name: /이어서 색칠하기/ })).toHaveCount(4)
})

test('scoped cache cleanup preserves other apps and all four backgrounds work offline', async ({ page, context }) => {
  const otherCache = 'kids-playground-legacy-fixture'
  const oldStudioCache = 'kids-coloring-studio:' + new URL(studioPath, test.info().project.use.baseURL).href + ':previous'
  await page.route('**/cache-fixture', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>Cache fixture</title>',
  }))
  await page.goto('/cache-fixture')
  await page.evaluate(async names => {
    for (const name of names) await caches.open(name)
  }, [otherCache, oldStudioCache])
  await page.goto(studioPath)
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
  expect(new URL(scope).pathname).toBe(studioPath)
  const cacheNames = await page.evaluate(() => caches.keys())
  expect(cacheNames).toContain(otherCache)
  expect(cacheNames).not.toContain(oldStudioCache)
  await context.setOffline(true)
  await page.reload()
  for (const id of expectedIds) {
    const drawing = drawings[id]
    await page.getByRole('button', { name: drawing.title + ', ' + drawing.colors.length + '색, 색칠하기' }).tap()
    const background = page.locator('image[data-background=true]')
    await expect(background).toHaveAttribute('href', studioPath + drawing.backgroundImage)
    const width = await background.evaluate(async element => {
      const image = new Image()
      image.src = element.getAttribute('href')!
      await image.decode()
      return image.naturalWidth
    })
    expect(width).toBeGreaterThan(0)
    await page.getByRole('button', { name: '도안 선택' }).tap()
  }
})

test('captures the standalone icon in Chromium', async ({ page }) => {
  await page.setViewportSize({ width: 512, height: 512 })
  const response = await page.goto('./icons/studio-512.png')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('img')).toBeVisible()
  await page.screenshot({ path: 'test-results/review/app-icon.png' })
})
