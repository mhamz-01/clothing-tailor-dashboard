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

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await context.addCookies([
  { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
])
const page = await context.newPage()
await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
await page.waitForTimeout(700)

const info = await page.evaluate(() => {
  const select = document.querySelector("select")
  if (!select) return "not found"
  const cs = getComputedStyle(select)
  const r = select.getBoundingClientRect()
  return {
    outerHTML: select.outerHTML.slice(0, 300),
    width: r.width,
    height: r.height,
    color: cs.color,
    paddingLeft: cs.paddingLeft,
    paddingRight: cs.paddingRight,
    fontSize: cs.fontSize,
    selectedText: select.options[select.selectedIndex]?.text,
  }
})
console.log(JSON.stringify(info, null, 2))

const el = await page.$("select")
if (el) await el.screenshot({ path: `${OUT_DIR}\\select-crop.png` })

await browser.close()
