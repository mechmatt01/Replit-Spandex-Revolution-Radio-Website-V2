# 🎸 Spandex Salvation Radio

A cutting-edge digital platform for streaming old-school metal music 24/7, featuring interactive geospatial experiences and advanced music discovery.

## 🚀 Live Demo

**Live Site**: [https://spandexsalvation.com](https://spandexsalvation.com)

## ✨ Features

- **🎵 Live Radio Streaming**: Multiple stations including Hot 97, Power 106, SomaFM Metal, and 95.5 The Beat
- **🎨 8 Premium Themes**: Dynamic theme system with adaptive backgrounds and glassmorphism effects
- **🌍 Interactive Global Map**: Real-time listener locations with weather integration
- **🎯 Real-time Metadata**: Live track information with iTunes artwork integration
- **🔐 Firebase Authentication**: Secure user accounts with Google OAuth support
- **📱 Mobile Responsive**: Optimized for all devices with touch-friendly controls
- **♿ Accessibility First**: WCAG 2.1 AA compliance with screen reader support
- **🛒 E-commerce Integration**: Merchandise store with Stripe payment processing
- **💬 Live Chat**: Real-time messaging for authenticated users
- **📊 Admin Dashboard**: Content management and analytics

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Drizzle ORM
- **Firebase** for authentication and hosting
- **Neon Database** for serverless PostgreSQL

### Services & APIs
- **Google Maps API** for interactive mapping
- **OpenWeatherMap** for weather data
- **iTunes API** for music metadata
- **Radio.co** for streaming infrastructure
- **Stripe** for payments
- **Shopify** for e-commerce

## 🏗️ Architecture

```
spandex-salvation-radio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom hooks
├── server/                 # Express.js backend
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API endpoints
│   └── metadataFetcher.ts # Music metadata service
├── shared/                 # Shared TypeScript schemas
├── functions/              # Firebase Cloud Functions
└── .github/workflows/      # CI/CD automation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Firebase project
- Required API keys (see Environment Variables)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/spandex-salvation-radio.git
cd spandex-salvation-radio
```

2. **Install dependencies**
```bash
npm install
cd client && npm install && cd ..
```

3. **Set up environment variables**
```bash
cp .env.template .env
# Fill in your API keys and database URL
```

4. **Set up database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5000` to see your application.

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Firebase
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# APIs
GOOGLE_MAPS_API_KEY="your-google-maps-key"
OPENWEATHER_API_KEY="your-openweather-key"
RADIO_CO_API_KEY="your-radio-co-key"
LASTFM_API_KEY="your-lastfm-key"

# Payments
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

## 📦 Deployment

### Firebase Hosting

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### GitHub Actions

The repository includes automated deployment workflows:
- **Push to main**: Deploys to production
- **Pull requests**: Creates preview deployments

## 🎨 Theme System

The application features 8 dynamic themes:

1. **Light Mode** - Clean white interface
2. **Dark Mode** - Classic dark theme
3. **Classic Metal** - Orange and black
4. **Black Metal** - Deep blacks with red accents
5. **Death Metal** - Dark reds and grays
6. **Power Metal** - Blues and silvers
7. **Doom Metal** - Purples and blacks
8. **Glassmorphism Premium** - Multi-color gradients with blur effects

## 🌍 Interactive Features

### Global Listener Map
- Real-time listener locations
- Weather integration
- Clickable country markers
- Fullscreen mode with smooth animations

### Audio Player
- Multi-station support
- Real-time track metadata
- Volume synchronization
- Album artwork display
- Adaptive themes based on album colors

## 🔐 Authentication

- Email/password registration
- Google OAuth integration
- Firebase Firestore user profiles
- Session management
- Premium subscription tiers

## 📱 Mobile Experience

- Touch-optimized controls
- Responsive design
- Mobile navigation
- Gesture support
- Offline-friendly

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Motion reduction options
- Focus management

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📈 Performance

- **Bundle Size**: 257.80 kB gzipped
- **Load Time**: < 2 seconds
- **Lighthouse Score**: 95+ overall
- **Mobile Optimized**: Progressive Web App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/spandex-salvation-radio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/spandex-salvation-radio/discussions)

## 🙏 Acknowledgments

- **SomaFM** for metal music streaming
- **Hot 97** for hip-hop content
- **iTunes API** for music metadata
- **Google Maps** for geolocation services
- **Firebase** for hosting and authentication
- **Vercel** for inspiration on modern web development

---

**Built with ❤️ for the metal community**

🎸 **Rock on!** 🎸
