# Money Buddy 🐵💰

Your friendly financial companion! A modern banking application with geofencing, locked savings, and AI assistance.

## 🌟 Features

- **Neon Database**: Lightning-fast serverless PostgreSQL database
- **Real Money Processing**: Square payment integration for deposits and withdrawals
- **Mapbox Geofencing**: Location-based transfer restrictions
- **Time-Restricted Transfers**: Set expiration times for money transfers
- **Locked Savings Accounts**: Time-locked savings with competitive interest rates
- **AI Assistant**: Gemini-powered banking assistant
- **Modern UI**: Purple/blue gradient theme with glassmorphism effects
- **Mobile Responsive**: Optimized for all devices
- **Bank-Grade Security**: Multi-factor authentication and encryption
- **Production Ready**: Full deployment setup with monitoring and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Neon Database Account
- Square Developer Account
- Mapbox Account
- Google AI API Key
- Vercel Account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/money-buddy.git
   cd money-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production.template .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Neon Database (Primary)
   DATABASE_URL=your_neon_database_url
   
   # Square Payment Processing
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_APPLICATION_ID=your_square_application_id
   SQUARE_ENVIRONMENT=sandbox
   
   # Mapbox Geofencing
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   
   # Google AI Assistant
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
   
   # Authentication
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_key
   STACK_SECRET_SERVER_KEY=your_stack_secret
   ```

4. **Initialize the database**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/neon-test to initialize
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   - Main app: http://localhost:3000
   - Demo page: http://localhost:3000/demo
   - Admin dashboard: http://localhost:3000/admin

## 🔧 Production Deployment

### Quick Deploy to Vercel

1. **Prepare for deployment**
   ```bash
   npm run build  # Test build locally
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Set up environment variables in Vercel Dashboard**
   - Go to your project → Settings → Environment Variables
   - Add all production variables from `.env.production.template`

4. **Initialize production database**
   - Visit `https://your-app.vercel.app/api/neon-test`
   - This will create tables and seed initial data

### Comprehensive Deployment Guide

For detailed production setup, see:
- 📋 [Production Checklist](./PRODUCTION-CHECKLIST.md)
- 📖 [Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Environment Setup](./docs/environment-setup.md)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **Authentication**: Stack Auth
- **Payments**: Square API
- **Maps**: Mapbox GL JS
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

### Project Structure

```
money-buddy/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── demo/              # Demo page
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility libraries
│   ├── neon.ts           # Database operations
│   ├── error-handler.ts  # Error handling
│   └── ...
├── docs/                  # Documentation
├── scripts/              # Build and deployment scripts
└── ...
```

## 📊 API Endpoints

### Database
- `GET /api/neon-test` - Test database connection and setup
- `GET /api/health` - Health check for monitoring
- `GET /api/db-info` - Database information

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Payments
- `POST /api/square/deposit` - Process deposit
- `POST /api/square/withdraw` - Process withdrawal
- `POST /api/webhooks/square` - Square webhook handler

### AI Assistant
- `POST /api/chat` - AI chat interface

## 🔐 Security Features

- **Environment Variable Validation**: Required variables checked on startup
- **Rate Limiting**: 100 requests per minute per IP
- **Error Handling**: Comprehensive error responses
- **HTTPS Only**: Secure cookie settings
- **Input Validation**: All inputs validated and sanitized
- **Database Security**: Parameterized queries, connection pooling

## 🎯 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run deploy       # Deploy to Vercel production
```

### Testing

```bash
# Test database connection
curl http://localhost:3000/api/neon-test

# Test health endpoint
curl http://localhost:3000/api/health

# Test demo page
open http://localhost:3000/demo
```

## 🔍 Monitoring

### Production Monitoring

- **Health Check**: `/api/health` endpoint
- **Database Status**: Real-time connection monitoring
- **Error Tracking**: Comprehensive error handling
- **Performance**: Built-in monitoring capabilities

### Key Metrics

- Database response time
- API endpoint performance
- Error rates and types
- User activity and engagement

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection**: Check Neon database URL and credentials
2. **Build Errors**: Run `npm run type-check` for TypeScript issues
3. **API Errors**: Check environment variables in Vercel dashboard
4. **Rate Limiting**: Implement proper caching strategies

### Getting Help

- 📧 [Issues](https://github.com/your-username/money-buddy/issues)
- 📖 [Documentation](./docs/)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Square](https://squareup.com/) for payment processing
- [Mapbox](https://mapbox.com/) for geofencing capabilities
- [Google AI](https://ai.google.com/) for AI assistant
- [Vercel](https://vercel.com/) for deployment platform

---

Made with 💖 by the Money Buddy team
