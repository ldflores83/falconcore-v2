# Ignium - Next-Generation AI Copilot

A modern, responsive landing page for Ignium, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Tech-dark theme with orange accents
- **Responsive**: Mobile-first design that works on all devices
- **Functional Waitlist**: Email collection with Firebase Firestore integration
- **Modular Components**: Clean, reusable component architecture
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Deployment**: Ready for Vercel, Netlify, or Firebase Hosting

## 📁 Project Structure

```
/frontends/ignium/
├── components/           # React components
│   ├── HeroSection.tsx
│   ├── WhatIsIgnium.tsx
│   ├── BuiltForYouIf.tsx
│   ├── WhatCanItDo.tsx
│   ├── PostLaunchAndTech.tsx
│   └── FinalCTA.tsx
├── pages/               # Next.js pages
│   ├── index.tsx        # Main landing page
│   ├── _app.tsx         # App wrapper
│   └── api/
│       └── waitlist.ts  # API endpoint
├── lib/                 # Utilities
│   └── firebase.ts      # Firebase configuration
├── styles/              # Global styles
│   └── globals.css
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd frontends/ignium
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a service account and download the credentials
4. Add the credentials to your `.env.local` file

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Custom color palette including `ignium-orange`
- Responsive design utilities
- Custom gradients and animations

## 📱 Components

### HeroSection
- Main landing section with call-to-action
- Animated gradient effects
- Feature highlights

### WhatIsIgnium
- Product explanation with visual elements
- Context-aware features showcase

### BuiltForYouIf
- Target audience personas
- Role-specific feature lists

### WhatCanItDo
- Capability showcase
- Interactive feature cards

### PostLaunchAndTech
- Technology stack overview
- Development roadmap
- Early access benefits

### FinalCTA
- Functional waitlist registration
- Email validation
- Success/error feedback

## 🎨 Design System

### Colors
- **Primary**: Orange (`#f97316`)
- **Background**: Dark gradient (`#1a1a2e` to `#0f0f1a`)
- **Text**: White and gray variations
- **Accents**: Orange gradients and highlights

### Typography
- **Headings**: Bold, large scale
- **Body**: Clean, readable fonts
- **Accents**: Gradient text effects

### Spacing
- **Sections**: `py-20` (80px vertical padding)
- **Components**: `gap-8` to `gap-12`
- **Responsive**: Mobile-first approach

## 🔌 API Endpoints

### POST /api/waitlist
- **Purpose**: Register email for waitlist
- **Body**: `{ email: string }`
- **Response**: `{ success: boolean, message: string }`
- **Storage**: Firebase Firestore collection `waitlist_ignium`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Firebase Hosting
1. Build the project: `npm run build`
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize Firebase: `firebase init hosting`
4. Deploy: `firebase deploy`

### Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `out`
4. Configure environment variables

## 🔒 Environment Variables

Required environment variables for Firebase integration:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ by the Ignium team 