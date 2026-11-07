# Headstart — Website

A static, responsive corporate website for **Headstart** (Branding & Marketing · C-Level Hiring & Payroll Compliance). It is plain HTML/CSS/JS with no framework, so it runs from any static host.

## Preview

Open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
```

## Structure

```
index.html                 Home
about.html                 About Us
branding-marketing.html    Branding & Marketing overview (+ 8 service pages)
talent-recruitment.html    C-Level Hiring & Payroll Compliance overview (+ 5 service pages)
our-works.html             Our Works (filterable)
partner.html               Partner With Us (+ partnership form)
contact.html               Contact Us (+ form, FAQ, map placeholder)
assets/css/style.css       Design system & all styles
assets/js/main.js          Animations, navigation, tabs, filters, form handling
assets/img/favicon.svg     Brand mark
build/data.js              ALL page content + company details
build/build.js             Page templates / generator
build/icons.js             Icon set, logo mark, WhatsApp icon
```

## Editing content

The HTML pages are generated. **Edit `build/data.js` (or the templates in `build/build.js`), then run:**

```bash
node build/build.js
```

If you edit the `.html` files directly, the next build overwrites your changes.

## Before launch: replace these placeholders

All of them are in `build/data.js` → `site`:

| Item | Field |
| --- | --- |
| Phone number | `phone`, `phoneHref` |
| Email | `email` |
| WhatsApp number (digits only, with country code) | `whatsapp` |
| Office address & hours | `address`, `hours` |
| Social profile links | `social` |
| Form submissions endpoint (e.g. Formspree, Getform) | `formEndpoint` |

Also:
- **Our Works** projects (`works` in `data.js`) are illustrative examples. Replace them with real case studies.
- The **Contact** page has a grey map placeholder. Replace it with a Google Maps embed in `build/build.js` (search for `map__ph`).
- Images load from the Unsplash CDN. If an image fails, a grey placeholder block shows in its place. To use your own photos, swap the Unsplash IDs in `data.js` / `build.js`.

## Forms

The site has six forms: General enquiry, Event enquiry, Hiring brief, Partnership, Contact and Newsletter. All of them validate in the browser.
- With `formEndpoint` empty, a submission shows the success state but **nothing is sent anywhere**.
- Set `formEndpoint` to a form service URL and submissions are POSTed as `FormData`, with `form` (type) and `page` fields added.
- Links like `contact.html?service=Corporate%20Events%20%26%20Conferences` pre-select the service in the dropdown.

## Design system

- **Colours (from the logo):** Forest green `#1B4A3E`, Gold `#C9963F`, Deep green `#0F2A23` (text & dark sections), Cream `#F7F4EC`
- **Logo:** rebuilt as HTML + SVG (`build/icons.js` → `logo()`), so it stays sharp at any size. The letters use the Montserrat 800 font and the gold "A" is an SVG. If you have the original vector logo, you can swap it in there.
- **Hero:** light cream background with a slowly drifting green/gold mesh gradient and a subtle grid/dot/diagonal pattern (`.mesh`, `.pattern` in the CSS)
- **Type:** Sora (headings), Inter (body), Montserrat (logo), all from Google Fonts
- **Motion:** scroll reveals, image wipe-ins, word-by-word text highlight, parallax, counters, process-line fill, marquee, rotating hero word. All of it is disabled automatically for users with "reduce motion" turned on.
