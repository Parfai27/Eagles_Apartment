# Eagles Apartment

Website for **Eagles Apartment**, furnished apartments in Grande Barrière, Goma (DR Congo), overlooking Lake Kivu.

Live site: https://parfai27.github.io/Eagles_Apartment/

## Structure

```
site/            the website (plain HTML, CSS and JavaScript – no build step)
  index.html       Home
  apartments.html  Apartments
  amenities.html   Amenities
  gallery.html     Gallery
  location.html    Location
  contact.html     Contact & booking form
  css/styles.css   all styles
  js/main.js       shared header/footer, slideshow, gallery, booking form
  js/i18n.js       English, French and Swahili text
  images/          optimised WebP photos and the logo
research/        research and template study
```

## Editing common things

- **Phone, WhatsApp, email:** `CONFIG` at the top of `site/js/main.js`.
- **Text in any language:** `site/js/i18n.js` (same key in `en`, `fr` and `sw`).
- **Gallery photos:** the `GALLERY` list in `site/js/main.js`.

## Run locally

```bash
python -m http.server 5173 --directory site
```

Then open http://localhost:5173.

## Publishing

The live site is served by GitHub Pages from the `gh-pages` branch, which holds the contents of `site/`.
After committing changes to `main`, publish them with:

```bash
git push origin `git subtree split --prefix site main`:gh-pages --force
```
