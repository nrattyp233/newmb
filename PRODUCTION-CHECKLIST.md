# 🚀 Money Buddy Production Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup (Neon)
- [ ] Create Neon production database
- [ ] Copy connection string (pooled)
- [ ] Copy connection string (unpooled)
- [ ] Test database connection
- [ ] Note database credentials

### 2. Authentication (Stack Auth)
- [ ] Create Stack Auth project
- [ ] Configure domains and redirects
- [ ] Get Project ID
- [ ] Get Publishable Client Key
- [ ] Get Secret Server Key

### 3. Payment Processing (Square)
- [ ] Create Square production application
- [ ] Get Application ID
- [ ] Get Access Token
- [ ] Set up webhook endpoints
- [ ] Get Webhook Signature Key
- [ ] Test sandbox → production migration

### 4. AI Assistant (Google Gemini)
- [ ] Create Google AI Studio account
- [ ] Generate API key
- [ ] Set usage limits (optional)
- [ ] Test API key functionality

### 5. Mapping (Mapbox)
- [ ] Create Mapbox account
- [ ] Create access token
- [ ] Configure allowed domains
- [ ] Set usage limits (optional)

## Environment Variables

### 6. Configure Production Environment
- [ ] Copy `.env.production.template` to `.env.production.local`
- [ ] Fill in all Neon database variables
- [ ] Fill in all Stack Auth variables
- [ ] Fill in all Square variables
- [ ] Fill in Google AI API key
- [ ] Fill in Mapbox access token
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Set production URLs

## Vercel Deployment

### 7. Vercel Setup
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Set up custom domain (optional)

### 8. Environment Variables in Vercel
- [ ] Go to Vercel Dashboard → Project → Settings → Environment Variables
- [ ] Add all variables from `.env.production.local`
- [ ] Set environment to "Production"
- [ ] Verify all variables are properly set

### 9. Build and Deploy
- [ ] Test build locally: `npm run build`
- [ ] Fix any build errors
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify deployment success

## Post-Deployment

### 10. Database Initialization
- [ ] Visit: `https://your-app.vercel.app/api/neon-test`
- [ ] Verify database schema creation
- [ ] Check test data seeding
- [ ] Confirm all tables exist

### 11. Feature Testing
- [ ] Test homepage: `https://your-app.vercel.app`
- [ ] Test demo page: `https://your-app.vercel.app/demo`
- [ ] Test admin dashboard: `https://your-app.vercel.app/admin`
- [ ] Test database connection
- [ ] Test authentication (if implemented)
- [ ] Test payment processing (if implemented)
- [ ] Test AI assistant (if implemented)
- [ ] Test geofencing maps (if implemented)

### 12. Performance & Security
- [ ] Check Core Web Vitals
- [ ] Test mobile responsiveness
- [ ] Verify HTTPS is working
- [ ] Check security headers
- [ ] Test database performance
- [ ] Monitor error rates

### 13. Domain & SSL (Optional)
- [ ] Configure custom domain in Vercel
- [ ] Update DNS records
- [ ] Verify SSL certificate
- [ ] Update environment variables with new domain
- [ ] Test all redirects

### 14. Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure monitoring alerts
- [ ] Set up performance monitoring
- [ ] Monitor database usage

## Production URLs

After deployment, your app will be available at:
- **Main App**: `https://your-app.vercel.app`
- **Demo Page**: `https://your-app.vercel.app/demo`
- **Admin Dashboard**: `https://your-app.vercel.app/admin`
- **Database Test**: `https://your-app.vercel.app/api/neon-test`

## Quick Commands

```bash
# Build and test locally
npm run build
npm run start

# Deploy to production
vercel --prod

# Check deployment status
vercel list

# View logs
vercel logs
```

## Emergency Rollback

If issues occur:
```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy previous version
vercel --prod --target=previous
```

## Support & Troubleshooting

### Common Issues:
1. **Build Errors**: Check TypeScript errors with `npm run type-check`
2. **Environment Variables**: Verify all variables are set in Vercel Dashboard
3. **Database Connection**: Test connection strings in Neon Console
4. **API Limits**: Check quotas in respective service dashboards

### Getting Help:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Neon: [console.neon.tech](https://console.neon.tech/)
- Stack Auth: [stack-auth.com](https://stack-auth.com/)
- Square: [squareup.com/developers](https://squareup.com/us/en/developers)

---

## ✅ Deployment Complete!

Once all checkboxes are complete, your Money Buddy app is ready for production! 🎉

**Remember to:**
- Monitor performance and usage
- Keep API keys secure
- Regularly update dependencies
- Backup important data
- Scale resources as needed
