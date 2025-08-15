# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# GCS-TEJAS

A modern Electron application built with React, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Modern React with hooks and concurrent features
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🖥️ **Electron** - Cross-platform desktop app framework
- 🔥 **Hot Reload** - Fast development with instant updates
- 📦 **Optimized Build** - Production-ready builds with electron-builder

## Project Structure

```
├── electron/           # Electron main process files
│   ├── main.ts        # Main Electron process
│   ├── preload.ts     # Preload script for secure IPC
│   └── util.ts        # Utility functions
├── src/               # React application source
│   ├── App.tsx        # Main React component
│   ├── main.tsx       # React application entry point
│   └── index.css      # Global styles with Tailwind
├── public/            # Static assets
├── dist/              # Built web application (generated)
├── dist-electron/     # Built Electron files (generated)
└── package.json       # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gcs-tejas

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
# Start development server (React + Electron)
bun dev
# or
npm run dev
```

This will:

1. Start the Vite development server on `http://localhost:5173`
2. Compile the Electron main process
3. Launch the Electron app with hot reload

### Building

```bash
# Build for production
bun run build
# or
npm run build

# Build and package the Electron app
bun run dist
# or
npm run dist
```

### Scripts

- `dev` - Start development server with hot reload
- `build` - Build the React app for production
- `lint` - Run ESLint to check code quality
- `preview` - Preview the built React app
- `electron:build` - Build Electron app for distribution
- `dist` - Build and package the complete application

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite with React plugin
- **Desktop**: Electron with security best practices
- **Linting**: ESLint with TypeScript and React rules
- **Bundling**: Vite for web, Electron Builder for desktop

## Development Tips

1. **Hot Reload**: The app supports hot reload for both React and Electron
2. **DevTools**: Development builds automatically open Chrome DevTools
3. **Security**: Context isolation and disabled node integration for security
4. **Type Safety**: Full TypeScript support with strict mode enabled

## License

MIT License

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
