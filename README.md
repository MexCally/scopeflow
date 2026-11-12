# Scopeflow — Website Project Estimator

Scopeflow is a responsive, browser-based estimator for website and web app projects. Visitors select a project type, features, delivery timeline, and operational needs to see a live estimate in Nigerian naira (₦). They can then submit the scope by email or open a pre-filled WhatsApp message.

## Features

- Four-step project scoping wizard with progress indicators.
- Live estimate range, including the express-delivery adjustment and a 20% upper estimate.
- Optional add-ons and operations/readiness choices.
- Contact form with name, business name, email, and phone number.
- Web3Forms email submissions and pre-filled WhatsApp quotes.
- Responsive layout, keyboard focus styles, and reduced-motion support.
- Basic input checks, a hidden Web3Forms honeypot, and client-side filtering of common placeholder and Mailinator email addresses.

## Run locally

This is a static site with no build step or package dependencies. Open `index.html` in a browser, or serve this folder with any static web server.

## Configure contact submissions

### Web3Forms

The form submits to `https://api.web3forms.com/submit`.

Web3Forms access keys are used in browser-side forms and are visible in page source and network requests; do not treat them as private secrets. Use Web3Forms' available spam protections and domain restrictions to reduce unauthorized submissions.

The email field checks address syntax, but does not verify that the visitor owns or can access that mailbox. The submitted email body is plain text; its headings use uppercase text and separators rather than rendered bold styling.

### WhatsApp

Set `WHATSAPP_PHONE` near the top of `script.js` to the recipient's phone number. The app strips punctuation and spaces, converts a Nigerian local number beginning with `0` to the `234` country code, and uses the resulting digits in a `wa.me` link.

The WhatsApp quote uses WhatsApp's `*bold*` formatting for headings and prices. Clicking the WhatsApp button opens WhatsApp with the message pre-filled; the visitor still sends it themselves.

## Estimate configuration

Edit the `PROJECTS`, `FEATURES`, and `OPERATIONS` objects near the top of `script.js` to change labels and prices.

| Category | Current options |
| --- | --- |
| Project types | Landing page/portfolio (₦100,000), business website (₦200,000), e-commerce (₦350,000), custom web app/SaaS (₦500,000) |
| Feature add-ons | UI/UX design (₦60,000), payment integration (₦50,000), authentication and dashboards (₦80,000), AI/automation (₦100,000) |
| Operations | Content and brand assets (₦40,000), domain and hosting setup (₦35,000), priority support (₦30,000); standard choices are included at no extra cost |
| Timeline | Standard delivery (no fee) or express delivery (+25%) |

Amounts are formatted with the `en-NG` locale. The estimate's upper range is 20% above the calculated total; review `getEstimate()` in `script.js` if the pricing model changes.

## Project files

- `index.html` — page structure, wizard steps, contact form, and Web3Forms access-key field.
- `style.css` — visual styles and responsive breakpoints.
- `script.js` — wizard state, estimate calculations, message generation, validation, and form submissions.

