import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Password').fill('changeme')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/dashboard**', { timeout: 10000 })
  })

  test('shows command center after login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible()
  })

  test('navigates to providers page', async ({ page }) => {
    await page.getByText('Providers').click()
    await expect(page.getByText('Configure AI providers')).toBeVisible()
    await expect(page.url()).toContain('/dashboard/providers')
  })

  test('navigates to models page', async ({ page }) => {
    await page.getByText('Models', { exact: false }).click()
    await expect(page.getByText('Browse and manage')).toBeVisible()
  })

  test('navigates to skills page', async ({ page }) => {
    await page.getByText('Skills').click()
    await expect(page.getByText('Manage skills')).toBeVisible()
  })

  test('navigates to intelligence page', async ({ page }) => {
    await page.getByText('Intelligence').click()
    await expect(page.getByText('Self-learning engine')).toBeVisible()
  })

  test('navigates to playground', async ({ page }) => {
    await page.getByText('Playground').click()
    await expect(page.getByText('Send a message')).toBeVisible()
  })

  test('navigates to memory page', async ({ page }) => {
    await page.getByText('Memory').click()
    await expect(page.getByText('Persistent memory')).toBeVisible()
  })

  test('navigates to vault page', async ({ page }) => {
    await page.getByText('Vault').click()
    await expect(page.getByText('Manage API keys')).toBeVisible()
  })

  test('navigates to settings page', async ({ page }) => {
    await page.getByText('Settings').click()
    await expect(page.getByText('General Settings')).toBeVisible()
  })

  test('signs out', async ({ page }) => {
    await page.getByText('Sign Out').click()
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })
})
