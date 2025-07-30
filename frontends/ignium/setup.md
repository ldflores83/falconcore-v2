# 🚀 Ignium Project Setup Guide

## Quick Start

Follow these steps to get the Ignium landing page running locally:

### 1. Install Dependencies

```bash
cd frontends/ignium
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate new private key
6. Copy the credentials to your `.env.local` file

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Project Structure

```
frontends/ignium/
├── components/          # React components
│   ├── HeroSection.tsx  # Main hero section
│   ├── WhatIsIgnium.tsx # Product explanation
│   ├── BuiltForYouIf.tsx # Target personas
│   ├── WhatCanItDo.tsx  # Capabilities showcase
│   ├── PostLaunchAndTech.tsx # Tech & roadmap
│   └── FinalCTA.tsx     # Waitlist form
├── pages/
│   ├── index.tsx        # Main page
│   ├── _app.tsx         # App wrapper
│   └── api/
│       └── waitlist.ts  # API endpoint
├── lib/
│   └── firebase.ts      # Firebase config
└── styles/
    └── globals.css      # Global styles
```

## Features

✅ **Complete Landing Page** - All sections implemented
✅ **Responsive Design** - Mobile-first approach
✅ **Functional Waitlist** - Email collection with validation
✅ **Firebase Integration** - Firestore database
✅ **Modern UI** - Tech-dark theme with orange accents
✅ **TypeScript** - Full type safety
✅ **Tailwind CSS** - Utility-first styling

## Next Steps

1. **Customize Content** - Update text and images
2. **Add Analytics** - Google Analytics, etc.
3. **SEO Optimization** - Meta tags, sitemap
4. **Deploy** - Vercel, Netlify, or Firebase Hosting

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check your `.env.local` file
   - Verify Firebase project settings
   - Ensure Firestore is enabled

2. **Build Errors**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors with `npm run build`

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check `globals.css` imports

## Support

For issues or questions, check the main README.md file or contact the development team. 