# Vercel Deployment Guide for Buy and Sell

This guide will help you deploy your Next.js marketplace application to Vercel.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MySQL Database**: You'll need a production MySQL database

## Step 1: Database Setup

### Option A: PlanetScale (Recommended)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection details
4. Import the schema: `mysql -h your-host -u your-user -p your-database < schema-mysql.sql`

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new MySQL database
3. Get your connection details
4. Import the schema

### Option C: Any MySQL Provider
- Use any MySQL hosting service
- Import the `schema-mysql.sql` file

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository: `yaminhassanmahdi/buyandsell`

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Set Environment Variables**
   Add these in the Vercel dashboard:

   ```env
   # Database Configuration
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
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NEXTAUTH_SECRET=your-super-secure-nextauth-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app

   # Google OAuth (if using)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Connection Pool Settings
   DB_CONNECTION_LIMIT=10
   DB_QUEUE_LIMIT=0
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DB_HOST
   vercel env add DB_USER
   vercel env add DB_PASSWORD
   vercel env add DB_NAME
   # ... add all other environment variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Post-Deployment Setup

### 1. Update Domain Settings
- Go to your Vercel project dashboard
- Navigate to "Settings" > "Domains"
- Add your custom domain if needed

### 2. Update SEO Files
Update these files with your actual domain:

1. **`public/robots.txt`**
   ```txt
   Sitemap: https://your-domain.vercel.app/sitemap.xml
   ```

2. **`public/sitemap.xml`**
   Replace all instances of `your-domain.vercel.app` with your actual domain

3. **`src/app/layout.tsx`**
   Update the `metadataBase` URL

### 3. Test Your Application
- Test user registration/login
- Test product listing
- Test admin panel access
- Test all major features

## Step 4: Environment Variables Reference

### Required Variables
```env
# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306

# App
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Buy and Sell
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Auth
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Optional Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Pool
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Business Settings
DEFAULT_CURRENCY=BDT
DEFAULT_CURRENCY_SYMBOL=৳
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript errors are resolved
   - Check the build logs in Vercel dashboard

2. **Database Connection Issues**
   - Verify your database credentials
   - Ensure your database allows external connections
   - Check if SSL is required

3. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check variable names (case-sensitive)
   - Ensure no extra spaces in values

4. **Images Not Loading**
   - Check image domains in `next.config.ts`
   - Ensure image URLs are accessible
   - Verify image optimization settings

### Getting Help

1. **Vercel Logs**: Check the function logs in your Vercel dashboard
2. **Database Logs**: Check your database provider's logs
3. **Browser Console**: Check for client-side errors
4. **Network Tab**: Check for failed API requests

## Performance Optimization

### 1. Enable Caching
- Vercel automatically caches static assets
- Consider implementing Redis for session storage

### 2. Image Optimization
- Use Next.js Image component
- Optimize image sizes before upload
- Use WebP format when possible

### 3. Database Optimization
- Use connection pooling (already configured)
- Implement database indexing
- Consider read replicas for high traffic

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Validate all user inputs
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Monitoring

### 1. Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor performance metrics

### 2. Error Tracking
- Consider adding Sentry for error tracking
- Monitor function execution times

### 3. Database Monitoring
- Monitor database connection usage
- Set up alerts for high usage

## Next Steps

After successful deployment:

1. **Set up monitoring and analytics**
2. **Configure custom domain**
3. **Set up SSL certificates** (automatic with Vercel)
4. **Implement backup strategies**
5. **Set up CI/CD pipelines**
6. **Configure staging environment**

## Support

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Check the project's GitHub issues
4. Contact support through Vercel dashboard 