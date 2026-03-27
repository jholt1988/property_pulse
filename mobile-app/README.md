# Property Pulse Mobile (Expo)

Mobile app scaffold for Property Pulse using Expo + React Native.

## 1) Install

```bash
cd mobile-app
npm install
```

## 2) Configure API base URL

Use one of:

- env var when starting:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_HOST:3001/api npm start
```

- or edit `app.json` `expo.extra.apiBaseUrl`

> For physical devices, do **not** use `127.0.0.1`; use your machine LAN IP.

## 3) Run

```bash
npm run start
```

Then press:
- `a` for Android emulator
- `i` for iOS simulator (macOS)
- or scan QR in Expo Go

## Current features

- Username/password login (`/auth/login`)
- Token persistence (AsyncStorage)
- Role normalization (`PM` -> `PROPERTY_MANAGER`)
- Dashboard fetch:
  - manager/owner -> `/dashboard/metrics`
  - tenant -> `/dashboard/tenant`
- Settings + sign out

## Next recommended steps

- Native form validation + error UX
- Maintenance and Payments screens
- Push notifications
- Deep links + session refresh
