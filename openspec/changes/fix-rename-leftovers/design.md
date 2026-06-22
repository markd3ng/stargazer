# Design: Fix Rename Leftovers

## Files to modify

### 1. IndexedDB Migration (`src/renderer/src/utils/db.ts`)
- Add `DataUsageDB.migrate()` static method
- On `open()`, detect if old DB `clashparty_db` exists
- If yes: open old DB, read all records, write to new DB `stargazer_db`, delete old DB
- Change `DB_NAME` constant to `'stargazer_db'`

### 2. macOS Helper Socket Path (`src/main/core/dns.ts`, `src/main/sys/sysproxy.ts`)
- Change `helperSocketPath` from `/tmp/mihomo-party-helper.sock` to `/tmp/stargazer-helper.sock`

### 3. macOS Installer Script (`build/pkg-scripts/postinstall`)
- Replace `Clash Party.app` → `Star Gazer.app`
- Replace `party.mihomo.helper` → `party.stargazer.helper`
- Replace `party.mihomo.app` → `party.stargazer.app`
- Replace data dir `mihomo-party` → `stargazer`
- Update log file path
- Update launch daemon label and paths

### 4. Preinstall Script (`build/pkg-scripts/preinstall`)
- Update cleanup paths to match new app name

### 5. Theme Repository URL (`src/main/resolve/theme.ts`)
- `mihomo-party-org/theme-hub` → `markd3ng/theme-hub`

### 6. Override Repository URL (`src/renderer/src/pages/override.tsx`)
- `mihomo-party-org/override-hub` → `markd3ng/override-hub`

### 7. Telegram Notification Script (`scripts/telegram.mjs`)
- `Clash Party` → `Star Gazer`
- Update GitHub URLs to point to correct repo

### 8. README.md
- Update all links and references

## Not modified (intentional)
- `scripts/copy-legacy-artifacts.mjs` — intentionally creates legacy names for update compatibility
- `scripts/prepare.mjs` — downloads from upstream repos, those are external dependencies
