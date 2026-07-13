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

const browser = await chromium.launch()

const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1920, height: 950 }, // simulate browser chrome eating height
  { width: 2560, height: 1440 },
  { width: 1366, height: 768 },
]

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: vp })
  await context.addCookies([
    { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ])
  const page = await context.newPage()
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)

  const info = await page.evaluate(() => {
    const board = document.querySelector('[style*="1360"]') || document.querySelector("div > div")
    const boards = Array.from(document.querySelectorAll("div")).filter((d) => d.style.width === "1360px")
    const b = boards[0]
    const r = b.getBoundingClientRect()
    return { rect: { width: r.width, height: r.height, left: r.left, top: r.top }, vw: window.innerWidth, vh: window.innerHeight }
  })
  const leftRightGap = info.vw - info.rect.width
  const topBottomGap = info.vh - info.rect.height
  console.log(`\n${vp.width}x${vp.height} -> board ${Math.round(info.rect.width)}x${Math.round(info.rect.height)} | LR gap total: ${Math.round(leftRightGap)}px | TB gap total: ${Math.round(topBottomGap)}px`)

  await context.close()
}

await browser.close()
