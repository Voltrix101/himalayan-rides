# 🚀 Deployment Guide

This guide will help you deploy your Himalayan Rides application to production.

## 🔥 Firebase Hosting (Recommended)

Firebase Hosting provides fast, secure hosting for your web app with global CDN.

### Prerequisites
- Firebase CLI installed globally
- Firebase project set up (see [Firebase Setup Guide](./FIREBASE_SETUP.md))

### Deploy Steps

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```

Select:
- Use existing project: `himalayan-rides-1e0ef`
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

4. **Build the project**
```bash
npm run build
```

5. **Deploy to Firebase**
```bash
firebase deploy
```

Your app will be available at: `https://himalayan-rides-1e0ef.web.app`

### Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records as instructed

## 🌐 Alternative Deployment Options

### Vercel
1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
npm run build
vercel --prod
```

### Netlify
1. **Build the project**
```bash
npm run build
```

2. **Drag and drop** the `dist` folder to Netlify dashboard
3. **Or connect GitHub repo** for automatic deployments

### GitHub Pages
1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add deploy script** to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Deploy**
```bash
npm run deploy
```

## 🔧 Environment Variables

### Production Environment
Create `.env.production` file:
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
# ... other Firebase config
```

### Security Notes
- Never commit API keys to version control
- Use Firebase security rules for database protection
- Enable HTTPS for production domains
- Set up proper CORS policies

## 🤖 Automated Deployment

### GitHub Actions (Already configured)
The repository includes a GitHub Actions workflow that automatically:
- Runs tests and linting
- Builds the project
- Deploys to Firebase Hosting on push to main

To enable:
1. Go to Firebase Console → Project Settings → Service accounts
2. Generate new private key
3. Add `FIREBASE_SERVICE_ACCOUNT` secret in GitHub repository settings

### Manual Triggers
You can also trigger deployments manually:
- Go to GitHub → Actions
- Select "Deploy to Firebase Hosting"
- Click "Run workflow"

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Preview production build locally
npm run preview
```

### Firebase Performance
- Enable Firebase Performance Monitoring
- Use Firebase Analytics for user insights
- Set up error tracking with Firebase Crashlytics

## 🔒 Security Checklist

Before deployment, ensure:
- [ ] Firebase security rules are properly configured
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled for custom domains
- [ ] API keys are restricted to specific domains
- [ ] User authentication is working correctly
- [ ] Payment gateway is in production mode
- [ ] Error handling is implemented
- [ ] Backup strategy is in place

## 📈 Monitoring

### Firebase Console
Monitor your app through:
- **Analytics**: User behavior and demographics
- **Performance**: Loading times and user experience
- **Crashlytics**: Error tracking and debugging
- **Authentication**: User sign-ups and activity

### Third-party Monitoring
Consider integrating:
- Google Analytics for detailed insights
- Sentry for error tracking
- LogRocket for session replay

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Firebase Deploy Fails**
```bash
# Check Firebase CLI version
firebase --version

# Re-login if needed
firebase logout
firebase login
```

**Environment Variables Not Loading**
- Ensure `.env` files are in project root
- Variables must start with `VITE_`
- Restart development server after changes

## 📞 Support

If you encounter deployment issues:
1. Check the [troubleshooting section](./README.md#troubleshooting)
2. Review Firebase Console logs
3. Open an issue on GitHub
4. Contact support through project channels

---

**Happy Deploying! 🚀**
