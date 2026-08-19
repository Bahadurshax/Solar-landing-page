# Reference material — not published

Nothing in here is served. `public/` is copied verbatim into `dist/`, so
anything parked there ships to the CDN whether or not the page references it;
these files were moved out of it for that reason.

- `images/solar-house-day-back.jpeg`, `images/solar-house-night-back.jpeg`
  The sharp originals of the hero's far plates. The shipped versions carry the
  defocus baked in (`-back-blur`), for the reason given on
  `.background-plate--back` in `styles.css`. Kept so the blur can be
  regenerated; not needed at runtime.
- `images/solar-heading-detail.png` — unreferenced.
- `footer-lab.html` — the footer design lab. It was reachable at
  `/footer-lab.html` on the deployed site.
