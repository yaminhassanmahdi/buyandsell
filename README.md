
# Buy and Sell - Online Marketplace

A modern online marketplace built with Next.js 15, TypeScript, and MySQL for buying and selling second-hand goods.

## Features

- 🛍️ **Product Management**: List, browse, and manage products with dynamic attributes
- 👥 **User Authentication**: Secure login/register with Google OAuth support
- 🛒 **Shopping Cart**: Full cart functionality with quantity management
- 💳 **Checkout System**: Complete checkout process with delivery calculations
- 👨‍💼 **Admin Panel**: Comprehensive admin dashboard for managing the platform
- 💰 **Commission System**: Automated commission calculation and withdrawal management
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: Beautiful interface with ShadCN UI components

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Database**: MySQL
- **Authentication**: Custom JWT + Google OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yaminhassanmahdi/buyandsell.git
   cd buyandsell
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_PORT=3306

   # Application Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_NAME=Buy and Sell
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Authentication
   JWT_SECRET=your-jwt-secret-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Set up the database**
   ```bash
   # Import the schema
   mysql -u your_user -p your_database < schema-mysql.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

### 1. Connect to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

### 2. Set Environment Variables

In your Vercel dashboard, add these environment variables:

```env
# Database Configuration (Use your production MySQL database)
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name
DB_PORT=3306

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Buy and Sell
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Authentication
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup

1. **Set up a MySQL database** (you can use PlanetScale, Railway, or any MySQL provider)
2. **Import the schema**: Use the `schema-mysql.sql` file
3. **Update environment variables** with your database credentials

### 4. Deploy

```bash
vercel --prod
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   ├── account/           # User account pages
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN UI components
│   └── ...
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
└── contexts/             # React contexts
```

## Key Features

### For Users
- Browse products by category
- Search and filter products
- Add items to cart
- Complete checkout process
- Manage orders and earnings
- List products for sale

### For Admins
- Product approval system
- Order management
- User management
- Commission settings
- Business configuration
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@buyandsell.com or create an issue in this repository.
