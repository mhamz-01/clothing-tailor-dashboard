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

for (const width of [1024, 768, 375]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addCookies([
    { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ])
  const page = await context.newPage()
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)

  const info = await page.evaluate(() => {
    const container = Array.from(document.querySelectorAll("div")).find((d) => d.className.includes("overflow-x-auto") && d.className.includes("items-start"))
    if (!container) return "container not found"
    const r = container.getBoundingClientRect()
    return {
      className: container.className,
      scrollWidth: container.scrollWidth,
      clientWidth: container.clientWidth,
      canScroll: container.scrollWidth > container.clientWidth,
      rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width) },
    }
  })
  console.log(`\n=== ${width} ===`)
  console.log(JSON.stringify(info, null, 2))
  await context.close()
}

await browser.close()
