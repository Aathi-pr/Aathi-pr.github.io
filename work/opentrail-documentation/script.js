(() => {
  const $ = id => document.getElementById(id), PDF = "assets/open-trail-documentation-e-pdf.pdf";
  const loader = $("loader"), bar = $("loadProgress"), status = $("loadStatus"), reader = $("reader"), viewport = $("bookViewport"), scaleNode = $("bookScale"), err = $("errorMessage");
  let book = null, total = 0, zoom = 1, pageW = 0, pageH = 0, resizeTimer;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  function progress(n, label) { n = Math.max(0, Math.min(100, Math.round(n))); status.textContent = `${label} · ${n}%`; if (window.gsap) gsap.to(bar, { scaleX: n / 100, duration: .18 }); else bar.style.transform = `scaleX(${n / 100})`; }
  function reveal() { const done = () => { loader.remove(); reader.style.opacity = 1; }; if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.to(loader, { yPercent: -100, duration: .7, ease: "power3.inOut", onComplete: done }); else done(); }
  function fail(message) { err.hidden = false; err.textContent = message + " Check that assets/opentrail-documentation.pdf exists and is a valid PDF."; status.textContent = "DOCUMENT COULD NOT BE LOADED"; reveal(); }
  function update(index) { let p = Math.max(1, Math.min(total, index + 1)); $("pageInput").value = p; $("pageInput").max = total; $("pageCount").textContent = "/ " + total; $("pageTotal").textContent = total + " PAGES"; let first = p === 1, last = p === total;["prevPage", "prevText", "firstPage"].forEach(id => $(id).disabled = first);["nextPage", "nextText", "lastPage"].forEach(id => $(id).disabled = last); $("progressFill").style.width = (p / total * 100) + "%"; }
  function go(p) { if (!book) return; let n = Math.max(1, Math.min(total, Math.round(Number(p) || 1))); book.turnToPage(n - 1); update(n - 1); }
  function prev() { if (book) book.flipPrev(); } function next() { if (book) book.flipNext(); }
  $("prevPage").onclick = $("prevText").onclick = prev; $("nextPage").onclick = $("nextText").onclick = next;
  $("firstPage").onclick = () => go(1); $("lastPage").onclick = () => go(total);
  $("pageInput").addEventListener("change", e => go(e.target.value)); $("pageInput").addEventListener("keydown", e => { if (e.key === "Enter") { go(e.target.value); e.target.blur(); } });
  function applyZoom() { if (!pageW || !pageH) return; let mobile = matchMedia("(max-width:650px)").matches, w = viewport.clientWidth - 8, h = viewport.clientHeight - 8; let naturalW = mobile ? pageW : pageW * 2; let fit = Math.min(w / naturalW, h / pageH, 1); let actual = Math.max(.5, Math.min(2, fit * zoom)); scaleNode.style.transform = `scale(${actual})`; $("zoomValue").textContent = Math.round(actual * 100) + "%"; $("zoomOut").disabled = zoom <= .7; $("zoomIn").disabled = zoom >= 2; }
  $("zoomIn").onclick = () => { zoom = Math.min(2, +(zoom + .15).toFixed(2)); applyZoom(); }; $("zoomOut").onclick = () => { zoom = Math.max(.7, +(zoom - .15).toFixed(2)); applyZoom(); }; $("fitView").onclick = () => { zoom = 1; applyZoom(); };
  $("fullscreen").onclick = async () => { try { if (!document.fullscreenElement) await $("viewer").requestFullscreen(); else await document.exitFullscreen(); } catch (e) { err.hidden = false; err.textContent = "Fullscreen is not supported by this browser."; } };
  document.addEventListener("fullscreenchange", () => setTimeout(applyZoom, 100));
  document.addEventListener("keydown", e => { if (e.target.matches("input,textarea,select,button,a")) return; if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); if (e.key === "+" || e.key === "=") { zoom = Math.min(2, zoom + .15); applyZoom(); } if (e.key === "-") { zoom = Math.max(.7, zoom - .15); applyZoom(); } if (e.key.toLowerCase() === "f") $("fullscreen").click(); });
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(applyZoom, 120); });
  async function init() {
    if (!window.pdfjsLib || !window.St || !window.St.PageFlip) throw Error("Viewer libraries could not load. Check your internet connection.");
    const pdf = await pdfjsLib.getDocument(PDF).promise; total = pdf.numPages; if (!total) throw Error("This PDF has no pages.");
    const first = await pdf.getPage(1), base = first.getViewport({ scale: 1 }), mobile = matchMedia("(max-width:650px)").matches, dpr = Math.min(devicePixelRatio || 1, 2);
    pageW = mobile ? 330 : 480; pageH = Math.round(pageW * base.height / base.width);
    let nodes = [];
    for (let i = 1; i <= total; i++) { let pg = i === 1 ? first : await pdf.getPage(i), v = pg.getViewport({ scale: pageW / base.width * dpr }), c = document.createElement("canvas"); c.width = Math.ceil(v.width); c.height = Math.ceil(v.height); let ctx = c.getContext("2d", { alpha: false }); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: ctx, viewport: v }).promise; let node = document.createElement("div"); node.className = "page"; let img = document.createElement("img"); img.alt = `OpenTrail Project Documentation — page ${i}`; img.src = c.toDataURL("image/jpeg", .9); node.appendChild(img); nodes.push(node); progress(5 + i / total * 90, "RENDERING PAGES"); if (i > 1) pg.cleanup(); }
    book = new St.PageFlip($("flipbook"), { width: pageW, height: pageH, size: "fixed", minWidth: 220, maxWidth: 560, minHeight: 280, maxHeight: 900, showCover: true, usePortrait: true, drawShadow: true, flippingTime: 750, maxShadowOpacity: .16, mobileScrollSupport: true, useMouseEvents: true, swipeDistance: 24, clickEventForward: true, autoSize: false });
    book.loadFromHTML(nodes); book.on("flip", e => update(e.data)); book.on("changeOrientation", applyZoom); update(0); progress(100, "READY"); applyZoom(); setTimeout(reveal, 220);
  }
  init().catch(e => { console.error(e); fail(e.message || "Unable to load PDF."); });
})();
