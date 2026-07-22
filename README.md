# Tazkiyah

A personal growth tracking app for a group challenge (default 21 days, admin-configurable). Participants log daily spiritual/wellness activities and compete on a shared, live leaderboard.

## Project structure

```
thazkiyah/
  backend/     Node.js + Express + MongoDB (Mongoose) REST API
  frontend/    React Native (Expo) app
```

## Core concept recap

- A **super admin** defines the daily activities (name, type, target, unit, points weight) and configures the challenge (start date + duration — never hardcoded).
- **Participants** log entries for each activity daily, view their own and others' progress, and see a live leaderboard.
- Scoring: each activity contributes `completionRatio * pointsWeight` (proportional model) or `pointsWeight` only at 100% completion (fixed model), summed per day and accumulated across the challenge.

---

## Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your real MongoDB URI and a strong JWT_SECRET
npm run seed            # creates the super admin, sample activities, and a default 21-day challenge
npm run dev              # starts the API on http://localhost:4000 (nodemon)
# or: npm start
```

Run the unit tests (scoring logic + date/challenge-duration logic):

```bash
npm test
```

### Running under PM2 (production)

For a long-running deployment, manage the API with [PM2](https://pm2.keymetrics.io/) instead of a bare `node`/`nodemon` process — it keeps the process alive across crashes and reboots:

```bash
npm run pm2:start     # starts via ecosystem.config.js
npm run pm2:logs      # tail logs
npm run pm2:restart   # restart after a deploy
npm run pm2:stop      # stop
npm run pm2:delete    # remove from PM2's process list
```

`pm2 save` + `pm2 startup` (run once, follow the printed instructions) will bring the app back up automatically after a server reboot.

### Environment variables (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime (default `30d`) |
| `SEED_ADMIN_NAME/EMAIL/PASSWORD` | Only used once by `npm run seed` |
| `WEB_PUSH_VAPID_PUBLIC_KEY` | Public VAPID key for browser push subscriptions |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | Private VAPID key used by backend to send push |
| `WEB_PUSH_CONTACT_EMAIL` | Contact email used in VAPID details (`mailto:`) |
| `PUSH_PRAYER_REMINDERS_ENABLED` | Set to `false` to disable prayer reminder scheduler |

**Never commit real secrets.** `.env` is gitignored; `.env.example` should only ever contain placeholder values.

### API overview

All routes are prefixed with `/api` and (except register/login) require `Authorization: Bearer <token>`.

| Method & Path | Auth | Description |
|---|---|---|
| POST `/auth/register` | — | Create a user account |
| POST `/auth/login` | — | Log in, returns JWT + user |
| GET `/auth/me` | user | Current user profile |
| GET `/activities` | user | List active activities (admin can pass `?includeInactive=true`) |
| POST `/activities` | admin | Create an activity |
| PUT `/activities/:id` | admin | Update an activity |
| DELETE `/activities/:id` | admin | Soft-delete (deactivate) an activity |
| GET `/challenge/status` | user | Current day number / total days / date range |
| POST `/challenge/configure` | admin | Set start date + duration (days) |
| GET `/entries/today` | user | Today's entries for the current user |
| GET `/entries/history` / `/entries/history/:userId` | user | Own or another participant's entry history (read-only community view) |
| POST `/entries/increment` | user | Append a counter/duration increment (summed daily, never overwritten) |
| POST `/entries/checkbox` | user | Set a checkbox activity's done state for a day |
| POST `/entries/checklist-item` | user | Toggle one sub-item (e.g. one of the 5 prayers) |
| GET `/scores/leaderboard` | user | All users ranked by total score |
| GET `/scores/me` / `/scores/user/:userId` | user | Day-wise score breakdown, own or another user's |
| GET `/users` | user | List participants (for the community view) |
| GET `/push/public-key` | user | Fetch VAPID public key for browser subscription |
| POST `/push/subscriptions` | user | Save/update this device's web push subscription |
| POST `/push/unsubscribe` | user | Disable this device's web push subscription |

A Postman collection can be generated from this table, or import the routes directly — each route file under `backend/routes/` documents its own validation rules.

### Architecture notes

- **Services** (`services/`) hold all business logic as classes (`AuthService`, `ActivityService`, `ChallengeService`, `EntryService`, `ScoreService`) — controllers stay thin and only translate HTTP <-> service calls.
- **Scoring** (`ScoreService.computeCompletionRatio` / `computePointsEarned`) is pure and unit-tested in isolation from the database.
- **Date/challenge-duration logic** lives solely in `utils/dateUtils.js` — nothing else hardcodes the number of challenge days.
- **DailyEntry** stores counter/duration values as an appended array of increments (`$push`), so multiple same-day additions never overwrite each other; totals are computed by summing.

---

## Frontend setup (Expo / React Native)

```bash
cd frontend
npm install
# Point the app at your backend (defaults to http://localhost:4000/api if unset):
echo "EXPO_PUBLIC_API_BASE_URL=http://<your-machine-ip>:4000/api" > .env
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go on a physical device. If testing on a physical device or emulator, `localhost` won't resolve to your backend — use your machine's LAN IP in `EXPO_PUBLIC_API_BASE_URL`.

### Architecture notes

- **Theme** (`src/theme/theme.ts` + `ThemeProvider`): all colors/spacing/fonts in one file, consumed via `useTheme()`.
- **App config** (`src/config/appConfig.ts`): app name, tagline, API base URL — one place to rebrand.
- **API layer** (`src/services/`): `ApiClient` is the single fetch wrapper (auth header injection, JSON parsing, error shaping); `AuthService`, `ActivityService`, `EntryService`, `ScoreService`, `UserService`, `ChallengeService` each wrap one REST resource.
- **Shared components** (`src/components/`): `Button`, `Card`, `ProgressBar`, `InputField`, `Header`, `ActivityItem` (renders differently per activity type), and `AddEntryModal` (shared by counter/duration entry).
- **Screens** (`src/screens/`): Login/Register, Today's Checklist, My Progress, Community Progress, Leaderboard, and an Admin stack (Manage Activities, Challenge Settings, All Users' Scores).
- **Navigation** (`src/navigation/`): `RootNavigator` switches Auth vs Main stack based on `AuthContext`; `MainNavigator` is a bottom-tab navigator that adds an Admin tab only for admin users.

### Web + PWA build

The web export is now PWA-enabled. During `npm run build:web`, the post-export script:

- rewrites root-absolute Expo asset paths for GitHub Pages base path support,
- generates `manifest.webmanifest`, `service-worker.js`, and install icons,
- injects manifest + theme meta tags and service worker registration into `dist/index.html`,
- includes push + notification-click handlers in the generated service worker,
- writes `.nojekyll` to keep `_expo/` files published on GitHub Pages.

### PWA prayer reminder pushes (phase 1)

Current implementation sends browser push reminders **5 minutes before each mandatory prayer** (`fajr`, `dhuhr`, `asr`, `maghrib`, `isha`) using `backend/prayer-times.json`.

Setup checklist:

```bash
cd backend
npx web-push generate-vapid-keys
# copy keys into backend/.env as WEB_PUSH_VAPID_PUBLIC_KEY and WEB_PUSH_VAPID_PRIVATE_KEY
npm start
```

Notes:

- The reminder scheduler runs in the backend process and checks once per minute.
- Prayer day-bucketing follows IST (`UTC+05:30`) to match existing date logic.
- Browser/device must grant notification permission and stay subscribed.

Build and deploy:

```bash
cd frontend
npm run build:web
npm run deploy:web
```

After deploy, open your site over HTTPS, then:

- in Chrome/Edge: look for the install button in the address bar,
- in Safari (iOS): use Share -> Add to Home Screen,
- test offline behavior by loading once, then switching network off and reloading.

---

## Seed data

Running `npm run seed` in `backend/` creates:
- One super admin (from `SEED_ADMIN_*` env vars)
- Six sample activities: Dhikr (counter), Tawheed Study (duration), Woke Before Fajr (checkbox), Tahajjud (checkbox), 5 Daily Prayers (checklist), Walk (counter)
- A default 21-day challenge starting today

## Future work (v1 non-goals)

- Advanced notification controls (quiet hours, per-prayer toggles, personalized schedules)
- Offline support / local sync queue
- Social features beyond read-only community progress and the leaderboard
