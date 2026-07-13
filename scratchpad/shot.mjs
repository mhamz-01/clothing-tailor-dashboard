import { chromium } from "playwright"
import { SignJWT } from "jose"
import fs from "node:fs"

const SECRET = new TextEncoder().encode("6945d94ed44c1b5c1867cae50beea75890be189e63c2de9e")

const token = await new SignJWT({ role: "tailor-customer", username: "qa-local" })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("3600s")
  .sign(SECRET)

const browser = await chromium.launch()
const context = await browser.newContext()
await context.addCookies([
  {
    name: "tailor_token",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
  },
])

const outDir = "C:\\Users\\hamza\\AppData\\Local\\Temp\\claude\\E--projects-Client-s-Projects-ClothingTailorDashboard-tailor-dashboard\\ef26def2-262d-4839-8ab7-b2b7df9c6e6d\\scratchpad"
fs.mkdirSync(outDir, { recursive: true })

for (const [label, width, height] of [
  ["desktop", 1440, 900],
  ["mobile", 375, 812],
]) {
  const page = await context.newPage()
  await page.setViewportSize({ width, height })
  const errors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)

  const url = page.url()
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

  await page.screenshot({ path: `${outDir}/${label}-full.png`, fullPage: true })

  console.log(`[${label}] url=${url} scrollWidth=${scrollWidth} clientWidth=${clientWidth} overflow=${scrollWidth > clientWidth}`)
  if (errors.length) console.log(`[${label}] console errors:`, errors)
  await page.close()
}

await browser.close()
