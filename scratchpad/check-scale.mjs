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
const context = await browser.newContext({ viewport: { width: 375, height: 812 } })
await context.addCookies([
  { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
])
const page = await context.newPage()
const errors = []
page.on("console", (m) => errors.push(`[${m.type()}] ${m.text()}`))
page.on("pageerror", (e) => errors.push(`[pageerror] ${e}`))
await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
await page.waitForTimeout(700)

const info = await page.evaluate(() => {
  const boards = Array.from(document.querySelectorAll("div")).filter((d) => {
    const s = d.getAttribute("style") || ""
    return s.includes("764") || d.style.width === "1360px"
  })
  return boards.map((b) => ({
    inlineStyle: b.getAttribute("style"),
    computedTransform: getComputedStyle(b).transform,
    rect: b.getBoundingClientRect().toJSON ? JSON.parse(JSON.stringify(b.getBoundingClientRect())) : null,
  }))
})
console.log(JSON.stringify(info, null, 2))
console.log("CONSOLE:", errors.slice(0, 20))

await browser.close()
