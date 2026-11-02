# Eagles Apartment

Website for **Eagles Apartment**, furnished apartments in Grande Barrière, Goma (DR Congo), overlooking Lake Kivu.

Live site: https://eagles-apartment.netlify.app

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

The live site is hosted on Netlify (project `eagles-apartment`). `netlify.toml` tells Netlify to publish the `site/` folder.
After making changes, publish them with:

```bash
netlify deploy --prod
```

(Run `netlify login` first if you are not logged in.)
