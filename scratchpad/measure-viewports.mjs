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

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
]

const browser = await chromium.launch()

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: vp })
  await context.addCookies([
    {
      name: "tailor_token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
  const page = await context.newPage()
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(800)

  const metrics = await page.evaluate(() => {
    const el = document.documentElement
    return {
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    }
  })

  const vOverflow = metrics.scrollHeight > metrics.clientHeight
  const hOverflow = metrics.scrollWidth > metrics.clientWidth

  console.log(`\n=== ${vp.width}x${vp.height} ===`)
  console.log("METRICS", JSON.stringify(metrics))
  console.log("V_OVERFLOW", vOverflow, vOverflow ? `(${metrics.scrollHeight - metrics.clientHeight}px)` : "")
  console.log("H_OVERFLOW", hOverflow, hOverflow ? `(${metrics.scrollWidth - metrics.clientWidth}px)` : "")

  if (vOverflow || hOverflow) {
    // Action bar buttons position
    const actionRowInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"))
      const labels = ["Save", "Clear", "Prev", "Next", "Print", "Delete", "Exit"]
      return buttons
        .filter((b) => labels.some((l) => b.textContent.trim() === l))
        .map((b) => {
          const r = b.getBoundingClientRect()
          return { text: b.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }
        })
    })
    console.log("ACTION_ROW", JSON.stringify(actionRowInfo))

    // find bottom-most and right-most elements
    const extremes = await page.evaluate(() => {
      const docH = document.documentElement.clientHeight
      const docW = document.documentElement.clientWidth
      let bottomMost = null
      let rightMost = null
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) return
        if (!bottomMost || r.bottom > bottomMost.bottom) {
          bottomMost = { tag: el.tagName, cls: el.className?.toString().slice(0, 60), text: el.textContent?.slice(0, 40), bottom: Math.round(r.bottom), top: Math.round(r.top) }
        }
        if (!rightMost || r.right > rightMost.right) {
          rightMost = { tag: el.tagName, cls: el.className?.toString().slice(0, 60), text: el.textContent?.slice(0, 40), right: Math.round(r.right), left: Math.round(r.left) }
        }
      })
      return { bottomMost, rightMost, docH, docW }
    })
    console.log("EXTREMES", JSON.stringify(extremes))
  }

  if (vp.width === 1366 || vp.width === 1440) {
    const suffix = vp.width
    await page.screenshot({
      path: `C:\\Users\\hamza\\AppData\\Local\\Temp\\claude\\E--projects-Client-s-Projects-ClothingTailorDashboard-tailor-dashboard\\cf0128f6-213d-475b-820b-411d16fdea28\\scratchpad\\shalwar-kameez-overflow-${suffix}.png`,
      fullPage: true,
    })
    console.log(`SCREENSHOT SAVED for ${suffix}`)
  }

  await context.close()
}

await browser.close()
