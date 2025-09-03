# CanSat GUI

A modern, minimal GUI application for CanSat competition ground control station built with Electron, React, Vite, and Tailwind CSS.

## Features

- 🛰️ Real-time telemetry data monitoring
- 📊 Interactive dashboard with mission controls
- 🎛️ Clean and intuitive user interface
- 📡 Data visualization and export capabilities
- 🚀 Cross-platform desktop application

## Project Structure

```
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron process
│   └── preload.js     # Preload script for security
├── src/               # React application source
│   ├── components/    # React components
│   ├── App.jsx        # Main App component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles with Tailwind
├── dist/              # Build output (generated)
└── assets/            # Static assets and icons
```

## Setup and Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Development mode:**

   ```bash
   npm run dev
   ```

   This will start both the Vite dev server and Electron application.

3. **Build for production:**
   ```bash
   npm run build
   npm run build:electron
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:vite` - Start only Vite dev server
- `npm run dev:electron` - Start only Electron (requires Vite server)
- `npm run build` - Build React app for production
- `npm run build:electron` - Build Electron app for distribution
- `npm run preview` - Preview production build

## Technologies Used

- **Electron** - Cross-platform desktop app framework
- **React** - UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety (configured)

## Development Notes

- The `src/` folder contains only React-related code
- Electron-specific code is isolated in the `electron/` folder
- Tailwind CSS is configured with custom CanSat theme colors
- The app uses a secure Electron setup with context isolation

## Contributing

This project is set up for CanSat competition development. Feel free to customize the components and add new features as needed for your specific mission requirements.
