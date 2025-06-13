
# 2ndhandbajar.com - Online Marketplace: Features & System Description

## 1. Project Overview

2ndhandbajar.com is an online marketplace designed for buying and selling second-hand goods. This document outlines the features, system architecture, and technical specifications of the prototype application.

## 2. Core Technology Stack

*   **Frontend Framework:** Next.js (v15) with App Router
*   **UI Library:** React (v18)
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Icons:** Lucide React
*   **Backend Logic:** Next.js API Routes (Node.js environment)
*   **Database:** PostgreSQL (connected via Next.js API Routes using the `pg` library)
*   **AI (Potential/Planned):** Genkit

## 3. User-Facing Features (Frontend)

### 3.1. General Users
    *   **Homepage (`/`):**
        *   Hero Banner/Slider (configurable via admin panel).
        *   Category Bar for quick navigation to category pages.
        *   Featured products/listings, potentially grouped by category.
    *   **Product Browsing & Discovery:**
        *   View products by parent category (`/category/[categoryId]`).
        *   Filter products by sub-category, price range, and dynamic category-specific attributes on the browse page (`/browse`).
        *   Sort products (newest, oldest, price low-high, price high-low, name A-Z, name Z-A).
        *   Breadcrumb navigation for easy understanding of location within the site.
        *   Sub-category scroller on category pages for quick filtering.
    *   **Product Details Page (`/products/[id]`):**
        *   View detailed product information: name, description, price, multiple images (if supported, currently single), stock status.
        *   View seller information (name).
        *   View category, sub-category, and selected dynamic attributes.
        *   Quantity selector for adding to cart.
        *   "Add to Cart" functionality.
    *   **Search Functionality (`/search?q=`):**
        *   Search products by name, description, or ID.
        *   Display search results in a grid.
    *   **Shopping Cart (`/cart`):**
        *   View items added to the cart.
        *   Update item quantities.
        *   Remove items from the cart.
        *   View subtotal and estimated delivery charges (calculated per seller based on buyer and seller addresses).
        *   Button to clear the entire cart.
        *   Proceed to checkout.
    *   **Checkout Process (`/checkout`):**
        *   Shipping address input/confirmation (persisted for logged-in users).
        *   Selection of available shipping methods.
        *   Order summary including item subtotal and total delivery charges.
        *   Mock payment gateway integration (no actual payment processing).
        *   Order placement.
    *   **Order Confirmation Page (`/order-confirmation/[orderId]`):**
        *   Display a confirmation message with essential order details upon successful order placement.
    *   **User Authentication:**
        *   Login (`/login`) with email/phone and password.
        *   Registration (`/register`) with name, phone number, password (email optional).
        *   Google Sign-In integration, including a flow to collect a phone number if not available from Google or existing account.
    *   **User Account Section (`/account/*`):**
        *   **My Orders (`/account/orders`):** View a list of past orders with their status and details.
        *   **My Listed Products (`/account/my-products`):** View products listed by the user, their status (pending, approved, rejected, sold), and mock delete functionality.
        *   **My Earnings (`/account/my-earnings`):** View pending earnings, total withdrawn amount, and request withdrawals of available funds.
        *   **Account Settings (`/account/settings`):**
            *   Update profile information (email, phone number, password).
            *   Manage default shipping address (add/edit).
            *   Manage withdrawal methods (bKash, Bank Account - add, remove, set default).
    *   **Custom Static Pages:**
        *   View custom pages created by the admin (e.g., Privacy Policy, Terms of Service, About Us) via their slugs.

### 3.2. Seller-Specific Features
    *   **Product Listing (`/sell`):**
        *   Form to upload new products for sale.
        *   Selection of parent category and optional sub-category.
        *   Selection of values for category-specific dynamic attributes (e.g., Author for books, Color for fashion).
        *   Input for product name, description, price, and stock quantity.
        *   Mock image upload (actual image upload and storage is a future enhancement).
        *   Products submitted go into a pending state for admin approval.
        *   Requires the user to have a default shipping address and at least one withdrawal method configured in their account settings.
    *   **View Earnings & Withdrawals:** (Covered in User Account Section above).

## 4. Admin Panel Features (`/admin/*`)

*   **Admin Dashboard (`/admin/dashboard`):**
    *   Overview statistics: Total platform commission, total platform sales (GMV), total delivery charges collected, total orders, number of registered users, number of products pending approval.
*   **Product Approval Queue (`/admin/products`):**
    *   View a list of products with 'pending' status.
    *   Approve or reject products, changing their status.
*   **Product Management:**
    *   **Manage All Products (`/admin/products/manage`):**
        *   Tabular view of all products with details (image, name, ID, seller, price, category, sub-category, attributes, status, listed date).
        *   Filter products by search term (ID, name, seller), status, and parent category.
        *   Mock edit/delete functionality for products.
    *   **Manage Parent Categories (`/admin/products/categories`):**
        *   Add, edit, delete parent categories.
        *   Configure category name, display image, image hint (for AI image search), and sort order.
        *   Configure up to 4 featured images per category (for display on the category page grid), including image URL, hint, link URL, and title.
    *   **Manage Sub-Categories (`/admin/products/sub-categories`):**
        *   Add, edit, delete sub-categories, associating them with a parent category.
        *   Configure sub-category name, display image, and image hint.
    *   **Manage Attribute Types (`/admin/products/attributes`):**
        *   Define attribute types (e.g., "Author", "Color", "Material") specific to each parent category.
    *   **Manage Attribute Values (`/admin/products/attribute-values`):**
        *   Define specific, selectable values for each attribute type (e.g., for "Author": "Mr. Rahim", "Humayun Ahmed"; for "Color": "Red", "Blue").
        *   Optionally associate an image and image hint with attribute values (e.g., a color swatch image for "Red").
    *   **Manage Brands (Legacy) (`/admin/products/brands`):**
        *   An informational page indicating that the global brands system has been deprecated in favor of category-specific attributes.
*   **Order Management:**
    *   **Manage All Orders (`/admin/orders/manage`):**
        *   Tabular view of all orders with key details (Order ID, Date, Customer, Total, Order Status, Payment Status).
        *   Filter orders by search term (Order ID, User ID, Name), order status, and payment status.
        *   Quickly update order status and payment status directly from the table using dropdowns.
        *   Link to a detailed view for each order.
    *   **Detailed Order View (`/admin/orders/[orderId]`):**
        *   View comprehensive details of a specific order: buyer information, shipping address, all items in the order (with product details and seller info), financial summary (subtotal, delivery charge, platform commission, total amount).
        *   View seller's shipping address and withdrawal methods.
        *   Update the order's status and payment status.
    *   **View Orders by Status (Dedicated Pages):**
        *   Processing Orders (`/admin/orders/processing`)
        *   Delivered Orders (`/admin/orders/delivered`)
        *   Cancelled Orders (`/admin/orders/cancelled`)
*   **Location Management:**
    *   **Countries (`/admin/locations/countries`):** View supported countries (currently hardcoded to Bangladesh).
    *   **Divisions (`/admin/locations/divisions`):** View pre-defined administrative divisions for Bangladesh.
    *   **Districts (`/admin/locations/districts`):** View pre-defined districts, filterable by division.
    *   **Upazillas/Thanas (`/admin/locations/upazillas`):** View pre-defined upazillas (thanas), filterable by district.
    *   **Delivery Charges (`/admin/locations/delivery-charges`):** Configure flat delivery fees for different scenarios: intra-upazilla, intra-district (different upazillas), and inter-district.
    *   **Shipping Methods (`/admin/locations/shipping-methods`):** Add or delete available shipping methods (e.g., "Standard Delivery", "Express Delivery") that users can choose during checkout.
*   **Financial Management:**
    *   **Withdrawal Requests (`/admin/financials/withdrawal-requests`):**
        *   View a list of withdrawal requests made by sellers.
        *   Process requests: Approve or reject them.
        *   Add administrative notes to requests.
        *   View seller's payment details for the selected withdrawal method.
    *   **Commissions (`/admin/financials/commissions`):**
        *   Set platform commission percentages on a per-parent-category basis.
    *   **Cash in Hand (Seller Dues) (`/admin/financials/cash-in-hand`):**
        *   View a list of sellers who have pending earnings available for withdrawal.
        *   Option for admins to record direct payments made to sellers (e.g., if payment is handled manually outside a formal request).
*   **General Settings:**
    *   **Business Settings (`/admin/settings/business`):**
        *   Configure application name, logo URL, primary and secondary theme colors (HSL format for `globals.css`), and favicon URL.
        *   Manage available currencies (add/remove codes, symbols, names) and set a default currency for the platform.
    *   **Banners (Sliders) (`/admin/settings/banners`):**
        *   Add, edit, and delete hero banner slides for the homepage.
        *   Configure image URL, image hint, title, description, button text, button link, background color, text color, and active status for each slide.
    *   **Custom Pages (`/admin/settings/custom-pages`):**
        *   Create, edit, and delete custom static content pages (e.g., Privacy Policy, Terms of Service, About Us).
        *   Set page title, URL slug, and content (supports Markdown or HTML).
    *   **Google Login (`/admin/settings/google-login`):**
        *   Configure Google OAuth Client ID and Client Secret (stored in `localStorage` for mock purposes).
*   **User Management (`/admin/users`):**
    *   View a list of all registered users.
    *   View detailed information for each user, including their basic profile, default shipping address, and configured withdrawal methods.

## 5. Data Management and Backend Architecture

*   **Initial Prototype Phase:**
    *   Utilized mock data arrays (e.g., `MOCK_PRODUCTS`, `MOCK_USERS` in `src/lib/mock-data.ts`) for core application data.
    *   Admin-configurable settings (like delivery charges, commissions, business settings, banners, custom pages, dynamic categories/attributes) were persisted in the browser's `localStorage` using the `useLocalStorage` hook.
*   **Transition to Live Backend (Current Phase):**
    *   **Database:** PostgreSQL. A `schema.sql` file located in the project root defines the database structure, including tables for users, products, categories, orders, addresses, withdrawal methods, settings, etc.
    *   **API Layer:** Next.js API Routes (located in `src/app/api/...`) are being implemented to handle all backend logic and CRUD (Create, Read, Update, Delete) operations.
        *   These API routes connect to the PostgreSQL database using the `pg` (node-postgres) library.
        *   Database connection details (host, port, user, password, database name, SSL CA certificate) are securely managed through environment variables (`.env.local` for development, server environment variables for production).
    *   **Data Flow:** Frontend components now make `fetch` requests to these Next.js API Routes to get or modify data, replacing direct mock data usage.
*   **User Data Persistence:**
    *   User-specific data like cart items and authentication status is managed client-side via React Context (`AuthContext`, `CartContext`) and `localStorage`.
    *   User profiles, addresses, withdrawal methods, listed products, and order history are intended to be stored and retrieved from the PostgreSQL database via API routes.

## 6. Key Architectural Considerations & Development Guidelines

*   **Next.js App Router:** Utilized for routing, layouts, Server Components, and API Routes.
*   **Server Components:** Default choice for components where possible to improve performance and reduce client-side JavaScript bundle size.
*   **Client Components (`"use client"`):** Used for components requiring interactivity, state, lifecycle effects, or browser-specific APIs.
*   **TypeScript:** Enforced for static typing, improved code quality, and better developer experience.
*   **Reusable Components:** Emphasis on creating modular and reusable UI components, primarily located in `src/components/`.
*   **ShadCN UI & Tailwind CSS:** ShadCN UI provides a set of pre-built, customizable components. Tailwind CSS is used for all utility-first styling.
*   **Centralized Theme:** A global theme is defined in `src/app/globals.css` using HSL CSS variables for primary, secondary, accent, background, and foreground colors, allowing for easy theme customization from the admin panel.
*   **Error Handling:**
    *   Frontend: Try-catch blocks for API calls, loading/error states in components.
    *   Backend (API Routes): Try-catch blocks for database operations, returning appropriate HTTP status codes and error messages.
    *   Next.js: `error.js` files for route segment error boundaries (planned).
*   **Image Optimization:** `next/image` component is used for automatic image optimization. Placeholder images from `placehold.co` with `data-ai-hint` attributes for future AI-powered image suggestions.
*   **Genkit for AI (Planned):**
    *   Guidelines are in place for creating Genkit flows, defining input/output schemas with Zod, using Handlebars for prompts, and implementing image generation or tool use if AI features are added.
*   **Environment Variables:** Critical for managing sensitive information (database credentials, API keys) securely. `.env.local` is used for local development (and is in `.gitignore`), while server environment variables are used for production deployments.

## 7. System Requirements (Conceptual for Prototype & Future)

*   **Development Environment:**
    *   Node.js (latest LTS recommended).
    *   npm or yarn.
    *   A PostgreSQL client (like DBeaver, pgAdmin) for database inspection.
*   **Deployment Environment (Planned):**
    *   A hosting platform supporting Next.js applications (e.g., Vercel, AWS Amplify, or a custom Node.js server setup on AWS EC2).
    *   A managed PostgreSQL database service (e.g., Aiven, AWS RDS, Supabase, Google Cloud SQL) accessible by the application server.
    *   Proper configuration of environment variables for database connection and any other third-party services.
*   **User Client:**
    *   Modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
    *   Internet connection.

This document serves as a living overview and will be updated as the project evolves and new features are implemented or refined.
      