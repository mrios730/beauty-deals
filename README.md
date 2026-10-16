# beauty-deals

**Velour Deals** — a beauty deals site built on the Velour design system.

A static site (plain HTML, CSS and JavaScript, no build step): browse deals by category, search, sort by discount, end date or price, save favourites (kept in the browser), copy promo codes, and sign up for a weekly email.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

To publish, enable GitHub Pages for this repo (Settings → Pages → deploy from `main`, root).

## Files

- `index.html` — page structure
- `assets/velour.css` — Velour design tokens (colours, type, spacing, radii) as CSS variables
- `assets/styles.css` — site styles, built only from those tokens
- `assets/deals.js` — the deal list (sample data with fictional brands and stores)
- `assets/app.js` — filtering, sorting, saving and code copying

## Next steps

- Replace `assets/deals.js` with a real deal feed, and add a link to the retailer on each deal.
- Connect the newsletter form to an email provider (it is a placeholder today).
