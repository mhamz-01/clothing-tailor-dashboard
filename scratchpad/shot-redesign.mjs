import { chromium } from "playwright"
import { SignJWT } from "jose"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve("E:/projects/Client's Projects/ClothingTailorDashboard/tailor-dashboard/.env.local") })

const SECRET = new TextEncoder().encode(process.env.TAILOR_JWT_SECRET)
const token = await new SignJWT({ role: "tailor-customer", username: "test-tailor" })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d")
  .sign(SECRET)

const OUT_DIR =
  "C:\\Users\\hamza\\AppData\\Local\\Temp\\claude\\E--projects-Client-s-Projects-ClothingTailorDashboard-tailor-dashboard\\ef26def2-262d-4839-8ab7-b2b7df9c6e6d\\scratchpad"

const viewports = [
  { width: 1440, height: 900, label: "1440x900" },
  { width: 1366, height: 768, label: "1366x768" },
  { width: 1024, height: 768, label: "1024x768" },
  { width: 768, height: 1024, label: "768x1024" },
  { width: 375, height: 812, label: "375x812" },
]

const browser = await chromium.launch()

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: vp })
  await context.addCookies([
    { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ])
  const page = await context.newPage()
  const errors = []
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()) })
  page.on("pageerror", (err) => errors.push(String(err)))
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(700)

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
  }))
  const overflow = metrics.scrollWidth > metrics.clientWidth || metrics.scrollHeight > metrics.clientHeight

  console.log(`\n=== ${vp.label} ===`)
  console.log("METRICS", JSON.stringify(metrics), "OVERFLOW", overflow)
  if (errors.length) console.log("CONSOLE ERRORS", errors)

  await page.screenshot({ path: `${OUT_DIR}\\redesign-${vp.label}.png` })
  await context.close()
}

await browser.close()
