# Zucur Mart Wholesale Hub

Build "ZUCUR MART" — a complete, premium B2B wholesale product catalogue and bulk inquiry platform.

Key Architecture & Specifications:
1. Business Model & Restrictions:
- Strictly B2B Wholesale Catalogue. NO shopping cart, NO checkout, NO online payment, NO consumer order flow.
- Two core customer conversion actions: (1) "Enquire on WhatsApp" and (2) "Bulk Order Inquiry".

2. Design & Color Theme:
- Theme: Deep Navy (#0F172A), Royal Blue (#2563EB), Warm Gold accent (#D4A72C), Soft White background (#F8FAFC), Crisp White cards (#FFFFFF). Modern, clean, compact B2B typography and spacing (Inter/Manrope). Fully responsive across mobile, tablet, and desktop with zero overflow.

3. Mandatory Visitor Gating:
- Before accessing the catalogue, visitors see a professional modal: Full Name (required), Phone Number (required), Email (optional).
- Store in database (visitors table) and persist identification in localStorage/session so returning visitors bypass the modal.

4. Backend & Database (Lovable Cloud / Supabase):
- categories: id, name, description, image, display_order, active
- products: id, category_id, name, sku, description, specifications, price, moq (integer >= 1, default 1), stock_status ('available', 'stock_out'), featured (boolean), active (boolean), created_at, updated_at
- product_images: id, product_id, image_url, display_order
- visitors: id, name, phone, email (nullable), first_visit, last_visit, visit_count
- whatsapp_enquiries: id, visitor_id, product_id, enquiry_type, created_at
- bulk_order_inquiries: id, visitor_id, product_id (nullable), product_name, product_sku, company_name, required_quantity, customer_name, customer_phone, customer_email, delivery_location, message, status ('New', 'Contacted', 'In Progress', 'Completed', 'Cancelled')
- site_settings: business_name, whatsapp_number, email, phone, address, business_hours, default_whatsapp_message, currency

5. Customer Experience & Pages:
- Sticky header with Logo, Home, Categories, Products, Bulk Order Inquiry, About, Contact, Search bar (no cart icon).
- Homepage: Hero section, Featured Categories, Featured Products with MOQ badge, Wholesale Benefits / Why ZUCUR MART, Bulk Order CTA section, Popular/New Products, WhatsApp banner, About, Contact, and rich 4-column dark footer with legal links.
- Product Cards & Details: Display Product Name, SKU, Category, Price, MOQ badge (e.g. "MOQ: 10 Units"), and Availability badge.
- WhatsApp Integration: Click "Enquire on WhatsApp" opens WhatsApp with dynamically formatted message including product details (Name, SKU, Price, MOQ, Availability) and customer details (Name, Phone, Email if provided). For "Stock Out" items, button changes to "Ask When Available" with availability alert message. Tracks every WhatsApp click to the analytics table.
- Dedicated Bulk Order Inquiry page (/bulk-order-inquiry) and accessible from Product Details (pre-fills Product Name, SKU, MOQ). Enforces quantity >= MOQ. Stores inquiry in bulk_order_inquiries with instant feedback.
- Product search, category filtering, availability filters, and sorting (price, newest, name).

6. Admin Portal (/admin):
- Protected admin area with dashboard analytics (Total Products, Stock Out, Visitors, WhatsApp Enquiries, Bulk Inquiries).
- Manage Products (Add/Edit/Delete, SKU, Price, MOQ with default 1, Stock Status toggle, Active/Inactive, Featured, multiple images).
- Manage Categories, Bulk Order Inquiries (with status management and notes), Visitors log, WhatsApp enquiry log, and Site Settings (configure business WhatsApp number and contact info).
- Seed realistic wholesale demo products and categories with high-quality images.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zucur-catalogue-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1e9087c4-0425-47a4-acd3-931ac8290085).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
