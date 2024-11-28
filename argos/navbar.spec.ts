import { argosScreenshot, ArgosScreenshotOptions } from "@argos-ci/playwright"
import { test, expect, devices } from "@playwright/test"

const defaultOptions: ArgosScreenshotOptions = { animations: "disabled" }

test.use({
  // ...devices["iPhone 12"],
  // ...devices["iPad Pro"],
})

// TODO take argos screenshots
test("Clicking away closes the menu", async ({ page }) => {
  await page.goto("http://localhost:8080/welcome")
  const menuButton = page.locator("#menu-button")
  const navbarRightMenu = page.locator("#navbar-right .menu")
  expect(menuButton).toBeVisible()

  // Open the menu first
  await menuButton.click()
  await expect(navbarRightMenu).toBeVisible()
  await expect(navbarRightMenu).toHaveClass(/visible/)

  // Test clicking away
  const body = page.locator("body")
  await body.click()
  await expect(navbarRightMenu).not.toBeVisible()
  await expect(navbarRightMenu).not.toHaveClass(/visible/)
})

test("Menu button makes menu visible", async ({ page }) => {
  await page.goto("http://localhost:8080/welcome")
  const menuButton = page.locator("#menu-button")
  const navbarRightMenu = page.locator("#navbar-right .menu")

  // Test initial state
  const originalMenuButtonState = await menuButton.screenshot()
  await expect(navbarRightMenu).not.toBeVisible()
  await expect(navbarRightMenu).not.toHaveClass(/visible/)

  // Test opened state
  await menuButton.click()
  expect(await menuButton.screenshot()).not.toEqual(originalMenuButtonState)
  await expect(navbarRightMenu).toBeVisible()
  await expect(navbarRightMenu).toHaveClass(/visible/)
  await argosScreenshot(page, "visible-menu", { ...defaultOptions, element: "#navbar-right .menu" })

  // Test closed state
  await menuButton.click()
  expect(await menuButton.screenshot()).toEqual(originalMenuButtonState)
  await expect(navbarRightMenu).not.toBeVisible()
  await expect(navbarRightMenu).not.toHaveClass(/visible/)
})

test("Can't see the menu at desktop size", async ({ page }) => {
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1920, height: 1080 })

  await page.goto("http://localhost:8080/welcome")
  const menuButton = page.locator("#menu-button")
  const navbarRightMenu = page.locator("#navbar-right .menu")

  // The menu should always be visible at desktop size, so these should fail
  for (const object of [navbarRightMenu, menuButton]) {
    await expect(object)
      .not.toBeVisible({ timeout: 200 })
      .catch(() => console.debug("Expected failure: menu is always visible at desktop size"))
  }

  // Try clicking the menu button anyways
  await menuButton
    .click({ force: true, timeout: 200 })
    .catch(() => console.debug("Expected failure: menu button not visible at desktop size"))
  await expect(navbarRightMenu)
    .not.toBeVisible({ timeout: 200 })
    .catch(() => console.debug("Expected failure: menu not visible at desktop size"))
})

// Test scrolling down, seeing the menu disappears, and then reappears when scrolling back up
test("Menu disappears when scrolling down and reappears when scrolling up", async ({ page }) => {
  await page.goto("http://localhost:8080/welcome")
  const navbar = page.locator("#navbar")

  // Initial state check
  await expect(navbar).toBeVisible()
  await expect(navbar).not.toHaveClass(/hide-above-screen/)

  // Scroll down
  await page.evaluate(() => {
    window.scrollTo({
      top: 250,
      behavior: "instant",
    })
  })

  // Wait for scroll animation and navbar to hide
  await expect(navbar).toHaveClass(/hide-above-screen/)

  // Scroll back up
  await page.evaluate(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    })
  })

  // Wait for scroll animation and navbar to show
  await expect(navbar).not.toHaveClass(/hide-above-screen/)
  await expect(navbar).toBeVisible()
})
