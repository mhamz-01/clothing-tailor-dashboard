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

for (const vp of [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
]) {
  const context = await browser.newContext({ viewport: vp })
  await context.addCookies([
    { name: "tailor_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ])
  const page = await context.newPage()
  await page.goto("http://localhost:3000/tailor/orders/shalwar-kameez", { waitUntil: "networkidle" })
  await page.waitForTimeout(600)

  const info = await page.evaluate(() => {
    const r = (el) => (el ? { top: Math.round(el.getBoundingClientRect().top), bottom: Math.round(el.getBoundingClientRect().bottom), left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) } : null)

    const divider = document.querySelector(".h-px.bg-slate-200")
    const measurementsHeader = Array.from(document.querySelectorAll("div")).find((d) => d.textContent.trim() === "Measurements" && d.children.length === 0)
    const partDesignTableWrap = Array.from(document.querySelectorAll("div")).find((d) => d.className.includes("border-t border-slate-200 pt-1"))
    const styleFlagsGroup = Array.from(document.querySelectorAll("input[type=checkbox]"))[0]?.closest("div")?.parentElement
    const saveBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Save")
    const orderSummaryHeader = Array.from(document.querySelectorAll("div")).find((d) => d.textContent.trim() === "Order Summary" && d.children.length === 0)
    const lastGridRow = Array.from(document.querySelectorAll("div")).find((d) => d.className.includes("md:grid-cols-[520px_1fr]"))

    return {
      dividerBottom: r(divider),
      lookupSectionRow2Bottom: r(lastGridRow),
      partDesignTableWrap: r(partDesignTableWrap),
      measurementsHeaderTop: r(measurementsHeader),
      styleFlagsGroupTop: r(styleFlagsGroup),
      saveBtnPos: r(saveBtn),
      orderSummaryHeaderTop: r(orderSummaryHeader),
    }
  })
  console.log(`\n=== ${vp.width} ===`)
  console.log(JSON.stringify(info, null, 2))

  await page.screenshot({ path: `${OUT_DIR}\\overlap-check-${vp.width}.png`, fullPage: true })
  await context.close()
}

await browser.close()
