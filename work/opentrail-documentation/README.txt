OPENTRAIL PROJECT DOCUMENTATION — RESPONSIVE FLIPBOOK

PDF placement:
  assets/opentrail-documentation.pdf

Responsive behavior:
- Desktop: two-page spread when the viewport allows it.
- Mobile: single-page portrait reading mode.
- Scales to the available screen and recalculates on resize/orientation changes.

Reader controls:
- First / Previous / Next / Last page
- Jump directly to a page number
- Zoom in / zoom out / fit to viewport
- Fullscreen mode
- Keyboard: left/right arrows, + / -, F for fullscreen
- Touch swipe and drag page turning

Local preview:
  python3 -m http.server 8000
Open http://localhost:8000

Upload the complete folder to GitHub Pages or another static host.
The PDF.js, StPageFlip and GSAP libraries are loaded from CDNs and need internet
access. Do not open index.html directly with file://.

Add your final OpenTrail PDF using the exact filename above before testing.
