# The Whimsical Pig — site rebuild

Rebuild of https://www.thewhimsicalpig.com. Plain HTML/CSS/JS, no build step:
open `index.html` in a browser to preview.

## Hosting (Cloudflare, free)

The site runs on the shop's Cloudflare account, as the Worker `whimsical-pig`
(https://whimsical-pig.whimsicalpig.workers.dev until the domain is connected).
Every push to `main` deploys automatically (settings in `wrangler.jsonc`), as long as the
Worker is connected to this repo in Cloudflare (Worker → Settings → Build, branch `main`,
deploy command `npx wrangler deploy`). The `name` in `wrangler.jsonc` must match the
Worker's name exactly, or the deploy won't update it. Cloudflare's drag-and-drop uploader
can't take this repo as-is because of the shop back end; use the Git connection instead.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: the full logo with the flying pig, featured banners, specialties, a peek at our work, and how ordering works |
| `work.html` | **Our Work**: the full gallery with Military / Framing / Apparel / Awards & Gifts filters |
| `visit.html` | **Visit**: address, hours, phone, email, map, and ways to reach us from out of town |
| `shop.html` | Online shop: items from Square with options, prices and stock left, sort and "Shop by event" filters, a cart, and card payment right on the page |
| `sign.html` | Printable partner sign with a QR code (opened from the admin page) |
| `vendor/qrcode.js` | QR code maker for the sign (MIT license, by Kazuhiko Arase) |
| `admin.html` | **Shop admin** at `/admin`: order requests, online orders, adding and editing shop items, stock counts and a setup check |
| `src/worker.js` | The shop's back end (runs on Cloudflare): item list, checkout, Square payment notices, admin |
| `order.html` | **Start an Order**: a step-by-step form with example pieces, questions per order type, and photo uploads |
| `story.html` | **Our Story**: the shop's story with the pig painting. Written from known facts only — add your own history (who started it, how, and why a pig) |
| `help.html` | **Help & FAQ**: common questions, what to have ready for each order type, how to mail items in, and caring for a framed piece |
| `site.css`, `site.js` | Shared look, header, footer and product list for every page |
| `settings.js` | **Edit this** for review and gift card links and the FAQ answers (banners are easier from `/admin` → Banners) |
| `shop-items.js` | Backup item list, shown only until Square is connected |
| `order-config.js` | **Edit this** to change order types, examples and questions, and where orders are sent |

## Shop-wide settings (`settings.js`)

| Setting | What it does |
| --- | --- |
| `announcement` | A notice bar at the top of every page, e.g. holiday order deadlines or closures |
| `reviewsUrl` | "Leave us a review" in the footer. It's `/review`, which forwards to Google's review box (`REVIEW_URL` in `wrangler.jsonc`). Print a counter sign from `/admin` → Setup → **Print Review Sign** |
| `giftCardUrl` | Adds a Gift Cards panel to the Shop |
| `faq` | The questions and answers on the Help page |
| `localPhotos` | File names of extra photos you've added to `images/` for cards that still use the current website's pictures |

**Please read through the FAQ answers.** They're written to be safe and general
(no promised turnaround times or deposit amounts). Once the shop decides on a
deposit policy or typical turnaround, put it in those answers so customers see it
before ordering.

## The shop and its admin page

**Square is the one place for shop items, prices, photos and stock.** Anything in
the Square category **Website** shows in the online shop. In-store and online sales
come out of the same stock count, and Square adds sales tax at checkout.

**How it works**

- **Shop page:** lists everything in Square's Website category, with options like
  sizes, price and how many are left. Customers can sort, filter by event or partner,
  add items to a cart, choose pick up or shipping, and pay by card right on the page.
  A size and a phone number are required before checkout.
- While a customer is paying, their items are held for 30 minutes so two people
  can't buy the last one.
- When Square reports a payment, it shows in the admin page under **Online Orders**.

**The admin page** (`/admin`, password protected) has these tabs:

| Tab | What it's for |
| --- | --- |
| Order Backup | A backup copy of every Start an Order request, with photos (orders are worked in shopVOX). Search, see whether each one reached shopVOX ("In shopVOX ✓"), resend one that didn't, email or call, delete. |
| Shop Orders | Paid orders from the website shop: items, pick up or ship address, buyer email. Mark them ready and picked up / shipped, and add notes like tracking numbers. |
| Shop Items | Every item in Square. **+ Add Item** (name, event or partner, sizes, price, a higher 2XL-and-up price, tax, photo). Edit name, description, event and price; turn "On the website" on or off; click the picture box to add or change a photo; count stock with + and −. Everything is saved in Square, so the register matches. |
| Banners | Notices on the website: a thin **top bar** or a big **feature banner** with a photo and a button. Pick the pages, the colors, and start/stop dates (a holiday deadline banner turns itself off after the date). Ready-made starters for holiday deadlines, closures and events. Ready-made holiday banners (closed for New Year's, Memorial Day, July 4, Labor Day, Thanksgiving, Christmas; Valentine's, Mother's/Father's Day, graduation, Military Appreciation Month, Veterans Day, Christmas order-by) come with the next dates filled in. **Holiday logos** (bottom of the tab): holiday versions of the big logo, header logo and flying pig, Off / On now / on between two dates every year. Use PNGs with see-through backgrounds. **Reviews on the home page**: paste reviews from Google with the reviewer's name; the home page shows up to 6 (hidden when there are none). |
| Site Photos | Every photo on the site, grouped by where it shows: Our Work (add, caption, replace, remove, move a photo to another group, rename a group), each page (home slideshow, Our Story, Visit…), and the Start an Order cards (replace or add a photo). **Use the original** undoes a change. |
| Facebook Posts | Makes a picture for a Facebook post (square, tall, wide, Story, page cover or event cover) with the logo, your words and any site photo or one from your device, plus a ready-to-paste caption. Pick a starting point, edit, **Download Picture**, **Copy Caption**, post. Nothing is saved; it all happens in the browser (`social.js`). |
| Setup | A checklist of what's connected, with anything missing in red. **Test shopVOX** checks the shopVOX connection. Also **Website visits** (page views, top pages, where visitors came from, orders started and sent; counted by the site itself, no cookies), **Delete Test Orders** (from Order Backup and their shopVOX leads) and **Download a Backup** (all orders and settings as one file, without photos). |

**More on the shop tools**

- **Low stock:** items at 2 or fewer (change with the `LOW_STOCK` variable) show in red on Shop Items, with a dot on the tab.
- **Telling customers (shop orders):** when a shop order is set to *ready* (pickup) or *picked up / shipped* (shipping), a message pops up already written. Edit it, then **Open in My Email** (your own email app, with it filled in) or **Text Them** (opens Messages on a phone). The card then shows "Told: Ready for pickup · text · Nov 5".
- **Pre-orders:** tick *Pre-order* on an item to sell it before it's made (event shirts). Stock doesn't limit it, customers see "Pre-order · Ready by …", and it stops on the last day you set. **Online Orders** shows a running "Pre-orders to make" count by size.
- **Partner pages:** Shop Items → **Partner Pages** lists a link for each event or partner, like `/shop.html?c=lewis-county-ren-faire`, which opens the shop on just their merch with an "Official merch" header. **QR Sign** opens a printable sign for their table.

**Adding things to the online shop**

Easiest: `/admin` → **Shop Items** → **+ Add Item**. Or in Square itself:

1. In Square: **Items → Categories → Create category** named **Website** (once).
2. Create or open an item, add its photo, price and options (sizes, colors…), and
   add it to the **Website** category. Turn on **stock tracking** if you want the shop
   to show how many are left and stop selling at zero.
3. It appears on the website within a minute.

**One-time setup**

Already in the code (`wrangler.jsonc` → `vars`): the Square location ID
(`6875TE29BSGD6`, Downtown Watertown Location) and $5 shipping (`SHIPPING_FEE`).

1. **Square app.** At https://developer.squareup.com, sign in with the shop's Square account
   and create an app (any name, e.g. "Whimsical Pig website"). Switch to **Production** and copy:
   - the **Application ID** (starts with `sq0idp-`, not secret): put it in `wrangler.jsonc` as
     `SQUARE_APPLICATION_ID`, or send it to whoever maintains the site.
   - the **Access token** (secret): add it in Cloudflare as a **Secret** named `SQUARE_ACCESS_TOKEN`
     (*Workers & Pages → whimsical-pig → Settings → Variables and Secrets → Add*).
2. **Admin password.** Same place: Secret `ADMIN_PASSWORD`. Then open `/admin` and log in.
3. **Check it.** `/admin` → **Setup**: everything should be green. Then buy one item yourself.

With the Application ID set, customers pay by card **right on the shop page** (Square's secure
card box; card numbers go straight to Square, never to this site). Payments are recorded the
moment they go through, so no webhook is needed. Without it, Buy sends customers
to Square's own checkout page instead, which needs a webhook (`payment.updated`, URL
`/api/square-webhook`, signature key as Secret `SQUARE_WEBHOOK_SIGNATURE_KEY`) to record payments.

Optional: `SQUARE_SHOP_CATEGORY` to use a category name other than "Website".

**shopVOX (one place to track custom orders)**

Every "Start an Order" request is copied into shopVOX as a **Sales Lead**: customer, phone,
email, needed-by date, every answer, and links to their photos. The admin page shows
"In shopVOX ✓" on each one, or a **Send to shopVOX** button if it didn't go through.

1. In shopVOX: your name (top right) → **My Profile → API Access → Show**.
   Use **Regenerate** if the token was ever shared anywhere.
2. In Cloudflare (*Workers & Pages → whimsical-pig → Settings → Variables and Secrets*), add:
   - `SHOPVOX_ACCOUNT_ID` (the Account ID)
   - `SHOPVOX_API_TOKEN` as a **Secret** (the API Token)
   - `SHOPVOX_PIPELINE` and `SHOPVOX_STAGE` are already set in `wrangler.jsonc`
     ("Sales Pipeline", starting in "Assigned"). Change them there if the pipeline is renamed.
   - `SHOPVOX_SALES_REP` ("Katarina Carman", in `wrangler.jsonc`) is the sales rep every website lead
     is assigned to. It must match her name in shopVOX exactly. The lead's expected close date
     is the customer's "needed by" date, and the first photo goes into the lead's Assets.
   - Military orders: the soldier picks their unit from suggestions (`units.js`, built from the
     shopVOX customer list). When it matches a shopVOX customer, the lead goes on that unit's
     record; a new unit comes in as a new customer under the unit's name.
   - Lead sources name the order type ("Website – Military Framing"), falling back to "Website".
   - So Katarina hears about each new website order: shopVOX **Settings → Notifications →
     Sales Leads → Created → Sales Rep**.
3. `/admin` → **Setup → Test shopVOX**.

To see customer emails on each order, connect the shop's inbox inside shopVOX (its email
integration links emails to quotes and orders), and send order updates from shopVOX.


Until Square is connected, the shop shows the items in `shop-items.js` with "Call to Order" buttons
(or a payment link pasted into `buyUrl`).

## Setting up "Start an Order"

Every order is saved on the admin page (**Order Backup**, with photos) and sent to
**shopVOX as a Sales Lead** with the photo links (see "shopVOX" above).

Customers pick what they want, choose a starting example, answer that order type's
questions, add photos and contact info, review, and send. You get one tidy message
with everything, plus an order reference like `WP-261015-K3QZ`.

**Where orders go:**

- **Admin page (always, on the live site):** every order is saved with its photos and
  shows up at `/admin` → **Order Backup**, and goes to shopVOX as a Sales Lead. Customer uploads open only for someone logged in, or through
  the private links in the shopVOX lead.
- **shopVOX:** each order becomes a Sales Lead there (once connected), with links to the photos.
- **Email copy (optional):** create a free form at https://formspree.io and paste its URL as
  `endpoint` in `order-config.js` to also get each order by email.
- **Fallback:** if the site can't save (for example a copy opened from a zip), the customer's
  email app opens with everything filled in.

The order types and questions follow the shop's own checklists (embroidery and military
framing) and the past year of orders: military plaques and framing were most common, then
embroidery and apparel, then plaques and engraving. Every order also asks when it's needed
in hand and whether it will be picked up or shipped (with the address if shipped).

**Made to prevent mistakes:** answers (and photos) survive a refresh, each order is only
saved once even if sent twice, phone/email/date/ZIP are checked, sizes are a grid, the rank
is picked from a list, and the review step has a "Check the spelling" box for everything
we engrave. Customers short on time can use **"Leave your number and we'll call you"** on
the first step; that comes in as a "Call-back request" lead in shopVOX.

**Changing questions:** each order type in `order-config.js` has a `questions` list.
Question types are `text`, `textarea`, `number`, `date`, `select`, `radio` (pick one)
and `checks` (pick several). Add `required: true` to make one mandatory.
The questions and options there are a sensible starting point; adjust them to
how the shop actually works (for example, your real background and frame choices).

**Example photos:** each order type and example can name a photo from
`images/work/` with `photo: "<name>"` (the file name without `-sm.webp`). Examples
without a photo show a plain card.

## Photos of our work

All shop photos live in `images/work/`. Each one has three files: a full size
`<name>.webp` (shown in the pop-up viewer), and two small copies, `<name>-sm.webp`
(640px) and `<name>-xs.webp` (480px). The browser picks whichever small copy suits
the screen. The list of photos, their groups and captions is `WORK` at the top of
`site.js`. The groups become the filter buttons on the Our Work page.

To add a photo: save all three sizes in `images/work/` (about 1400px, 640px and
480px on the long side, WebP), then add a line to `WORK` with the file name, group and caption. The home
page slideshow, specialties and preview pick their photos by name in
`index.html`; Our Story and Visit pick shop photos the same way.

Pig cursors: `images/cursor-hoof.png` (a hoof print for the normal pointer) and `images/cursor-tail.png` (a curly tail over links and buttons), with `@2x` versions for sharp screens.

Brand images: `images/logo-full.webp` (full logo with the name, used on the home page),
`images/flying-pig.webp` (the flying pig mascot), `images/logo-mark.webp` (header/footer logo), `images/favicon.png`, and `images/painting.webp` (the pig
painting on Our Story). White backgrounds were made transparent.

`images/logo-original.png` is the original logo file. `images/logo.png` is the same
logo with the black background around it made transparent; the site uses that one.

## Speed

- Fonts are hosted in `fonts/` (no trip to Google), and the two main ones are preloaded.
- `_headers` tells browsers to keep photos for a week and fonts for a year. Pages, CSS
  and JS are checked on every visit, so changes show up right away.
- Photos below the first screen load only when scrolled to, and the home slideshow
  loads each photo just before it's shown.

## Downloading the current site into `original/`

Pick one option:

**Option 1: wget (Mac/Linux, or Windows via WSL)**

```sh
cd original
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent \
     -e robots=off https://www.thewhimsicalpig.com/
```

**Option 2: HTTrack (Windows/Mac app)**

Install HTTrack from https://www.httrack.com, start a new project, enter
`https://www.thewhimsicalpig.com/`, and choose the `original` folder as the save location.

**Option 3: from the browser, one page at a time**

Open each page, press Ctrl+S (Cmd+S on Mac), and choose "Webpage, Complete".
Save the files into `original/`.


### Website orders in shopVOX

Each website order becomes a shopVOX **sales lead** with every answer, the customer's details and **every photo and PDF** under Assets (sent together as `asset[]`, the way the shop's shopVOX keeps them all). The lead's details start with a link to **one page with all the customer's photos and answers**, which has a **Download all photos** button (one .zip). Quotes and sales orders are made in shopVOX as usual; photos added to a quote carry over to its sales order. (Making sales orders from the website was tried and removed: shopVOX's API on this account can't attach photos to a sales order or pick the real product for a line item.)


## Pages for search and for soldiers

- `fort-drum.html`, `guidons.html`, `snowshoes.html`, `plaques.html`: service pages (linked from the home page's specialties and the footer, listed in the sitemap). Shared styles are the `.svc` rules at the end of `site.css`.
- `_redirects`: the old website's page addresses (location.html, regulation-guidons.html, 10th-mountain-snowshoes.html…) send visitors to the matching new page, so Google results and old links keep working once thewhimsicalpig.com points here.

## Preview site (test changes before they go live)

A second copy of the site, **whimsical-pig-preview**, built from the `claude/kind-turing-6oczei` branch. It has its own empty database and no Square or shopVOX keys, so test orders never reach customers, Square or shopVOX. Every page shows a yellow "Preview site" strip, and Google is told not to list it.

**One-time setup (Cloudflare dashboard, the shop's account):**
1. Workers & Pages → Create → Import a repository → `the-whimsical-pig/whimsical-pig`.
2. Project name: `whimsical-pig-preview`. Under build settings set **Deploy command** to `npx wrangler deploy --env preview`, and the **production branch** to `claude/kind-turing-6oczei`.
3. After the first deploy: the new Worker → Settings → Variables and Secrets → add the secret `ADMIN_PASSWORD` (can be different from the live one).
4. The preview lives at https://whimsical-pig-preview.jeepboy9478.workers.dev (set up on the developer's Cloudflare account, separate from the live site).

**How changes flow:** new work is pushed to `claude/kind-turing-6oczei` first → it appears on the preview site → once it looks right, it's merged into `main` → the live site updates.

### Versions tab (preview site only)
On the preview site's admin page, **Versions** shows what's waiting to go live, with **Go Live**, and lets you put the live site or the preview **back to an earlier version** (this adds a new version that matches the old one, so it can be undone the same way). It only changes the website's code, never orders, banners, photos or other saved things. **Reset Preview Data** empties the preview's own test data.

One-time setup: a GitHub fine-grained token for `the-whimsical-pig/whimsical-pig` with **Contents: Read and write**, saved as the secret `GITHUB_TOKEN` on the preview Worker (the tab walks you through it).

## Shadow Box & Frame Planner (`planner.html`, `planner.js`, `planner-defaults.js`)
Six short steps: **Start** (shadow box or flat frame, then one of the shop's starter ideas or from scratch), **Size & colors** (any listed size or a custom one typed in, background/backing, frame, and for frames a mat), **Your items**, **The plate**, **Arrange**, **Send it**. "Not sure? Skip ahead" on every step jumps to the end, where customers can just write what they have in mind. The page says plainly it's only for planning and the shop frames almost anything, in any size.

The look follows the shop's own work: mahogany frames on black, an optional bordered window around each piece (white, gold, silver, red, black — the shop can add colors) and thin lines joining the pieces. With no photos and a few small pieces, they sit on each side of the plate, the way the shop lays out guidon boxes. Starter ideas include Guidon with rank & plate, Flag, ribbons & coins, Company guidons, Guidon & coin collection, Unit colors & plate, Uniform jacket and the 10th Mountain snowshoe.

**Layouts** (Arrange step, or set per starter idea in admin): *Neat rows*, *Around the center* (the biggest piece in the middle with the rest down its sides, like a unit print or colors with guidons around it) and *Collection grid* (like pieces in even rows, for coins and crests). Dragging snaps into line with the middle of the box and other pieces (pink guides); **Center It** and the arrow keys (Shift for 1 inch) fine-tune the picked piece. **Share This Plan** packs the plan (not customer photos) into a link that opens it on any device.

Items are plain, common-size blanks, each with sizes to pick from; customers can type any other size, and **Something else** adds anything with its own name, shape and size. In frame mode only items marked "fits a flat frame" are offered. Everything is drawn at its real size and keeps a set distance from the edge (0.75 in to start). The planner lays everything out (neat rows, or packed tighter when full) and offers a bigger size when things don't fit. Dragging only works on the Arrange step, so phones can scroll normally; on phones the picture stays at the top while choices scroll below.

**Admin → Shadow Box Planner** controls all of it (saved with the site settings as `planner`, sent in `/api/site`):
- **Items**: add, rename, remove or reorder; group, plain shape, color, "fits a flat frame", sizes; a picture or PDF (first page) of the real thing.
- **Starter Ideas**: ready-made plans (type, size, items and their sizes, plate and wording).
- **Sizes, Colors & Mats**: box sizes, space around the edge, backgrounds, frames, mats and mat borders.
- **Plates & Wording**: plate colors and widths, and suggested plate wording (Retirement, PCS…).

`planner-defaults.js` holds the starting lists, used until the shop saves its own. PDFs are read in the browser with PDF.js (`vendor/pdfjs/`, Apache-2.0), loaded only when a PDF is picked.

The plan stays in the customer's browser. **Use This Plan in My Order** opens Start an Order (Military Framing → Shadow Box, or Framed Guidon or Flag for a frame) with the plan's picture added to their photos, the matching items ticked, and a "Shadow box plan" line (type, size, colors, mat, every item and size, the plate wording and their notes).

## Discount & referral codes (Admin → Codes)
Codes for custom orders (Start an Order → shopVOX), not the online shop. Each code has what the customer gets (free text, like "10% off"), who it's for (an affiliate or partner, optional), an end date and a use limit (both optional), private notes, and an on/off switch.

- Customers type a code in **Discount or referral code** on the contact step and see right away whether it's good. A code link (`/order.html?code=WYATT10`, or `?code=` on any page) fills it in for them, remembered for 60 days.
- The code goes in the order summary, at the top of the shopVOX lead and in the lead's title ("· Code WYATT10"), so Kat takes the discount off when she prices the job. A code that isn't valid is still passed along, marked "not valid".
- Each code shows how many orders used it and which ones, a link to copy, and a printable **QR Sign** (`sign.html?code=…`).
- Codes are stored in the `promo_codes` table; the code used is saved on each order (`requests.promo`) and in the backup.

## No-pickup dates (Admin → Banners & Reviews → Banners)
Date ranges when nobody can pick up an order (for example the first week of January). On Start an Order, choosing pickup with a "needed by" date in a range shows a message right away and won't let the customer continue (shipping is fine). A heads-up shows under the pickup choice when a range is within about 75 days, and by the shop's pickup option within 30 days. The **No pickups** ready-made banner writes itself from the next range. Saved with the site settings as `nopickup` and sent in `/api/site`.

