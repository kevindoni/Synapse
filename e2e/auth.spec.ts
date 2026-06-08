import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Adnify')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('rejects wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Invalid password')).toBeVisible()
  })

  test('logs in with correct password and redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Password').fill('changeme')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/dashboard**', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })
})
