// Shared popup-print helper for the order sheet and the receipt.
//
// The old pattern attached `load`/`afterprint` listeners from the opener
// right after window.open(). That's racy: the popup starts as about:blank
// and navigates to the blob URL, and listeners added to the original window
// object can be lost across that navigation -- and even when `load` fires,
// on a slow connection (deployed server) images can still be undecoded/
// failed, so the print dialog captured a sheet with blank images.
//
// Instead the print logic is injected into the document itself, so it runs
// inside the popup after the real navigation: it waits for every <img> to
// load AND decode (retrying a failed one a couple of times with a cache-
// busting query), waits for fonts, and only then calls print(). A hard
// timeout still prints so a permanently broken image can't hang the flow.

const PRINT_SCRIPT = `<script>
(function () {
  var MAX_RETRIES = 3;
  var TIMEOUT_MS = 20000;
  var printed = false;

  function settle(img) {
    return new Promise(function (resolve) {
      var tries = 0;
      function check() {
        if (img.complete && img.naturalWidth > 0) {
          (img.decode ? img.decode() : Promise.resolve()).then(resolve, resolve);
        } else if (img.complete) {
          fail();
        }
      }
      function fail() {
        if (tries >= MAX_RETRIES) return resolve();
        tries++;
        var base = img.getAttribute("data-src") || img.getAttribute("src");
        img.setAttribute("data-src", base);
        img.src = base + (base.indexOf("?") === -1 ? "?" : "&") + "r=" + Date.now() + tries;
      }
      img.addEventListener("load", check);
      img.addEventListener("error", fail);
      check();
    });
  }

  function doPrint() {
    if (printed) return;
    printed = true;
    window.focus();
    window.print();
  }

  var images = Array.prototype.slice.call(document.images).map(settle);
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var ready = Promise.all(images.concat([fonts])).then(function () {
    return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
  });

  Promise.race([ready, new Promise(function (r) { setTimeout(r, TIMEOUT_MS); })]).then(doPrint);
  window.addEventListener("afterprint", function () { window.close(); });
})();
</script>`

export function printHtmlInPopup(html: string, features: string): void {
  const withScript = html.includes("</body>")
    ? html.replace("</body>", `${PRINT_SCRIPT}</body>`)
    : html + PRINT_SCRIPT
  const blob = new Blob([withScript], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const printWindow = window.open(url, "_blank", features)
  if (!printWindow) {
    URL.revokeObjectURL(url)
    throw new Error("Couldn't open the print window — check if your browser is blocking pop-ups for this site.")
  }

  // The popup owns printing and closing itself; the opener only has to
  // release the object URL once the popup can no longer need it.
  const release = window.setInterval(() => {
    if (printWindow.closed) {
      window.clearInterval(release)
      URL.revokeObjectURL(url)
    }
  }, 2000)
}
