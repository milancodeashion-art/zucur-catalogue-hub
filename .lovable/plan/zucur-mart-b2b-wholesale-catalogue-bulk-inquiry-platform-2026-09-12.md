# ZUCUR MART — B2B Wholesale Catalogue & Bulk Inquiry Platform

A premium wholesale product catalogue with no cart and no checkout. Visitors browse products and convert through two actions only: **Enquire on WhatsApp** and **Bulk Order Inquiry**. An admin area manages products, inquiries and settings.

## Look and feel

Deep navy and royal blue with a warm gold accent, soft white page background and crisp white cards. Compact, modern business typography (Manrope headings, Inter body). Everything works cleanly on phone, tablet and desktop with no sideways scrolling.

## Visitor gate

First-time visitors see a professional welcome dialog asking for Full Name and Phone Number (required) and Email (optional). Their details are saved, and remembered on this device so they never see the dialog again. Every return visit updates their visit count.

## Customer pages

- **Sticky header**: logo, Home, Categories, Products, Bulk Order Inquiry, About, Contact, and a search box. No cart anywhere.
- **Home**: hero, featured categories, featured products with MOQ badges, "Why ZUCUR MART" benefits, bulk-order call to action, popular/new products, WhatsApp banner, short About and Contact blocks, and a rich four-column dark footer with legal links.
- **Categories** listing and per-category product grids.
- **Products**: search, category filter, availability filter, and sorting by price, newest or name.
- **Product detail**: name, SKU, category, price, MOQ badge ("MOQ: 10 Units"), availability badge, image gallery, specifications, and both conversion buttons.
- **Bulk Order Inquiry page** (`/bulk-order-inquiry`): company name, required quantity (must be at least the product MOQ), contact details, delivery location and message. Opening it from a product pre-fills product name, SKU and MOQ. Confirmation shown instantly after submitting.
- **About** and **Contact** pages, plus Privacy Policy and Terms pages for the footer links.

## WhatsApp behaviour

"Enquire on WhatsApp" opens WhatsApp with a ready-written message containing the product name, SKU, price, MOQ and availability plus the visitor's own name, phone and email. For stock-out items the button becomes "Ask When Available" with a restock-focused message. Every click is logged for the admin analytics.

## Admin portal (`/admin`)

Sign-in protected. Dashboard shows Total Products, Stock Out, Visitors, WhatsApp Enquiries and Bulk Inquiries. Sections: Products (add/edit/delete, SKU, price, MOQ default 1, stock toggle, active, featured, multiple images), Categories, Bulk Order Inquiries with status (New, Contacted, In Progress, Completed, Cancelled) and internal notes, Visitors log, WhatsApp enquiry log, and Site Settings for business WhatsApp number and contact details.

## Demo content

Realistic wholesale categories and products (packaging, cleaning supplies, disposables, stationery, kitchenware, personal care) with high-quality images, seeded so the site looks complete on first load.

## Technical notes

- Lovable Cloud backend with tables: `categories`, `products`, `product_images`, `visitors`, `whatsapp_enquiries`, `bulk_order_inquiries`, `site_settings`, plus `user_roles` + `has_role()` for admin access. Row-level security throughout: public read on active catalogue rows and settings, public insert for visitor/enquiry capture, admin-only reads of visitor and inquiry logs.
- Writes and privileged reads go through typed server functions; admin routes live under the authenticated layout with an admin role check.
- Design tokens defined once in `src/styles.css`; no hardcoded colours in components.
- Per-page titles, descriptions and social preview metadata.

## Needs your input

- Business WhatsApp number, contact email, phone, address and business hours — I'll seed placeholders you can change in Site Settings.
- Admin login: sign up once at `/admin` after launch and I'll grant that account admin rights, or tell me the email to use.
