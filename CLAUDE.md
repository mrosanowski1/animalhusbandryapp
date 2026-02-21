# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (choose Android/iOS/web from menu)
npm run android      # Run on Android emulator/device
npm run ios          # Run on iOS simulator/device
npm run web          # Run web version
npm run lint         # Run ESLint
```

No test framework is configured.

## Architecture

**React Native + Expo 54** app targeting iOS, Android, and web from a single TypeScript codebase.

### Routing

Uses **expo-router** (file-based routing). All screens live under `app/`:
- `app/_layout.tsx` — root layout, wraps the app with the theme provider
- `app/(tabs)/_layout.tsx` — defines the two-tab navigation (Home, Explore)
- `app/(tabs)/index.tsx` — Home screen
- `app/(tabs)/explore.tsx` — interactive enclosure map
- `app/enclosure/[enclosureId].tsx` — dynamic enclosure detail screen; fetches data from the C# backend at `https://localhost:44311/Enclosures/{enclosureId}`

### Data & Types

DTO types matching the C# backend (PascalCase) are defined in `Types/DtoTypes.tsx`. Data is fetched directly in screen components via `fetch`.

### Components & Theming

- `components/ui/` — low-level primitives (`IconSymbol` has a platform-specific `.ios.tsx` variant using SF Symbols; Android/web use Material icons)
- `ThemedText` / `ThemedView` — automatically switch colors for light/dark mode using `useThemeColor` from `hooks/use-theme-color.ts`
- `constants/theme.ts` — all color and font tokens for both modes
- `ParallaxScrollView` — animated parallax header built with `react-native-reanimated`

### Path Alias

`@/*` resolves to the repo root (configured in `tsconfig.json`).

### Key Config

- **New Architecture** enabled (`newArchEnabled: true` in `app.json`)
- **React Compiler** (experimental) enabled in `app.json`
- **Strict TypeScript** (`tsconfig.json`)
- **ESLint** uses flat config format (ESLint 9.x) with the Expo preset
