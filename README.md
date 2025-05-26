# 2ndhandbajar.com - Online Marketplace

This is a Next.js application for 2ndhandbajar.com, an online marketplace for buying and selling second-hand goods.

## Getting Started

This project is built with Next.js and TypeScript, utilizing ShadCN UI components and Tailwind CSS for styling.

To get started with development:

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` (or the port specified in `package.json`).

## Core Features

*   **Product Browsing**: Users can browse products with filtering by category/brand.
*   **Shopping Cart**: Users can add products to their cart and proceed to checkout.
*   **User Authentication**: Secure user login/registration with email (mocked).
*   **Product Listing**: Users can upload and list their own products for sale (mocked, admin approval).
*   **Admin Order Management**: Admin can approve products and manage order statuses (mocked).
*   **Shipping Address Input**: Users can set their shipping address during checkout.
*   **Order Tracking**: Buyers can track their order status (mocked).

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   ShadCN UI
*   Lucide React (Icons)
*   Genkit (AI features - not part of this UI build)

## Project Structure

*   `src/app/`: Contains all the pages and layouts for the Next.js App Router.
*   `src/components/`: Reusable UI components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/admin/`: Components specific to the admin panel.
*   `src/contexts/`: React Context providers (e.g., AuthContext, CartContext).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions, type definitions, constants, and mock data.
*   `src/ai/`: Genkit AI related files (managed separately).
