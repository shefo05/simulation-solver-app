# Simulation Solver - Progressive Web App

A React + TypeScript Progressive Web App for simulation calculations including:
- Linear Congruential Generator (LCG)
- Middle-Square Method
- Single Server Queue Simulation
- Multi-Server Queue Simulation
- Inventory Simulation
- Queuing Theory Calculator
- Chi-Square Test (KS-Test)
- Autocorrelation/Independence Test

## Features

- ✅ React + TypeScript
- ✅ Tailwind CSS for styling
- ✅ Progressive Web App (PWA) - Installable on mobile devices
- ✅ Responsive design for all screen sizes
- ✅ Modern UI with Tailwind CSS

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add PWA icons** (see PWA_ICONS.md):
   - Create or download `pwa-192x192.png` and `pwa-512x512.png`
   - Place them in the `public/` directory

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## PWA Installation

### Mobile (Android/iOS)

1. Build and deploy the app to a web server (or use `npm run preview` for testing)
2. Open the app in your mobile browser
3. Look for the "Add to Home Screen" or "Install App" prompt
4. Follow the instructions to install
5. The app will work offline after the first visit

### Desktop

1. Build and deploy the app (or use `npm run preview`)
2. Open the app in Chrome/Edge
3. Click the install icon in the address bar
4. Or go to Settings > Apps > Install this site as an app

## Project Structure

```
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Static assets and PWA icons
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration with PWA plugin
```

## Technologies Used

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Vite PWA Plugin
- Workbox

## Development

The app uses Vite for fast development and building. The PWA features are handled by `vite-plugin-pwa` which automatically generates the service worker and manifest.

## License

MIT

