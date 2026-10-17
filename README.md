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
- `assets/prettypenny.css` — Pretty Penny design tokens (colours, type, spacing, radii) as CSS variables
- `assets/styles.css` — site styles, built only from those tokens
- `assets/deals.js` — the deal list: Ulta Beauty and Sephora deals gathered by web search (see the date at the top of the file); expired deals hide themselves
- `assets/app.js` — filtering, sorting, saving and code copying
- `assets/img/` — product photos and brand logos referenced by `image` / `logo` in `deals.js`

## Updating

GitHub Pages lets browsers cache files for up to 10 minutes. After changing a CSS or JS file, bump the `?v=` date on its link in `index.html` so visitors get the new version straight away.

## Next steps

- Refresh `assets/deals.js` regularly; ideally pull straight from ulta.com or an affiliate feed so prices stay current and each deal links to its product page.
- Connect the newsletter form to an email provider (it is a placeholder today).
