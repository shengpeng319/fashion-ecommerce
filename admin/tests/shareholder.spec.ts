import { test, expect } from '@playwright/test'

test.describe('股东管理模块', () => {
  test('股东列表页', async ({ page }) => {
    await page.goto('/#/shareholder/list')
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('股东配置页', async ({ page }) => {
    await page.goto('/#/shareholder/config')
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('股东Dashboard页', async ({ page }) => {
    await page.goto('/#/shareholder/dashboard')
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })
})
