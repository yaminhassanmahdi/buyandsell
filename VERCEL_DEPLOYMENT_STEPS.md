# 🚀 Vercel Deployment Steps

Follow these steps to deploy your Buy and Sell marketplace to Vercel.

## Step 1: Prepare Your Repository

Your code is already pushed to GitHub at: `https://github.com/yaminhassanmahdi/buyandsell`

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Click "Import Git Repository"
   - Select your repository: `yaminhassanmahdi/buyandsell`

3. **Configure Project**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (leave as default)
   - **Output Directory:** `.next` (leave as default)

4. **Set Environment Variables**
   Click "Environment Variables" and add these one by one:

   ```env
   # Database Configuration
   DB_HOST=13.203.104.73
   DB_USER=2ndhandbajar_com
   DB_PASSWORD=2ndhandbajar_com
   DB_NAME=2ndhandbajar_com
   DB_PORT=3306

   # Application Configuration
   NODE_ENV=production
   NEXT_PUBLIC_APP_NAME=Buy and Sell
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   # Authentication (CHANGE THESE SECRETS!)
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-immediately
   NEXTAUTH_SECRET=your-super-secure-nextauth-secret-change-this-immediately
   NEXTAUTH_URL=https://your-app.vercel.app

   # Connection Pool Settings
   DB_CONNECTION_LIMIT=10
   DB_QUEUE_LIMIT=0

   # Business Settings
   DEFAULT_CURRENCY=BDT
   DEFAULT_CURRENCY_SYMBOL=৳

   # Image Domains
   NEXT_PUBLIC_IMAGE_DOMAINS=images.unsplash.com,placehold.co,2ndhandbajar.com

   # Debug Mode
   DEBUG=false
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
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
   # Enter: 13.203.104.73
   
   vercel env add DB_USER
   # Enter: 2ndhandbajar_com
   
   vercel env add DB_PASSWORD
   # Enter: 2ndhandbajar_com
   
   vercel env add DB_NAME
   # Enter: 2ndhandbajar_com
   
   vercel env add DB_PORT
   # Enter: 3306
   
   vercel env add NODE_ENV
   # Enter: production
   
   vercel env add NEXT_PUBLIC_APP_NAME
   # Enter: Buy and Sell
   
   vercel env add NEXT_PUBLIC_APP_URL
   # Enter: https://your-app.vercel.app
   
   vercel env add JWT_SECRET
   # Enter: your-super-secure-jwt-secret-key-change-this-immediately
   
   vercel env add NEXTAUTH_SECRET
   # Enter: your-super-secure-nextauth-secret-change-this-immediately
   
   vercel env add NEXTAUTH_URL
   # Enter: https://your-app.vercel.app
   
   vercel env add DB_CONNECTION_LIMIT
   # Enter: 10
   
   vercel env add DB_QUEUE_LIMIT
   # Enter: 0
   
   vercel env add DEFAULT_CURRENCY
   # Enter: BDT
   
   vercel env add DEFAULT_CURRENCY_SYMBOL
   # Enter: ৳
   
   vercel env add NEXT_PUBLIC_IMAGE_DOMAINS
   # Enter: images.unsplash.com,placehold.co,2ndhandbajar.com
   
   vercel env add DEBUG
   # Enter: false
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Post-Deployment Setup

### 1. Update Your App URL
After deployment, Vercel will give you a URL like:
`https://buyandsell-xxxxx.vercel.app`

Update these environment variables with your actual URL:
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`

### 2. Update SEO Files
Update these files with your actual domain:

**`public/robots.txt`:**
```txt
Sitemap: https://your-actual-domain.vercel.app/sitemap.xml
```

**`public/sitemap.xml`:**
Replace all instances of `your-domain.vercel.app` with your actual domain.

### 3. Test Your Application
- Test user registration/login
- Test product browsing
- Test admin panel access
- Test all major features

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your Vercel project dashboard
   - Click "Settings" > "Domains"
   - Add your custom domain

2. **Update Environment Variables**
   Update the URLs with your custom domain:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXTAUTH_URL`

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify your database credentials
   - Check if your server allows external connections
   - Ensure the database is accessible from Vercel's servers

3. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check variable names (case-sensitive)
   - Ensure no extra spaces in values

4. **Images Not Loading**
   - Check image domains in `next.config.ts`
   - Ensure image URLs are accessible

### Getting Help:

1. **Vercel Logs**: Check function logs in your Vercel dashboard
2. **Database Logs**: Check your server logs
3. **Browser Console**: Check for client-side errors
4. **Network Tab**: Check for failed API requests

## Security Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Change NEXTAUTH_SECRET to a secure random string
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets

## Performance Optimization

- Vercel automatically optimizes static assets
- Database connection pooling is configured
- Image optimization is enabled
- Code splitting is automatic

## Monitoring

- Enable Vercel Analytics in your dashboard
- Monitor function execution times
- Set up error tracking if needed

Your application should now be live on Vercel! 🎉 