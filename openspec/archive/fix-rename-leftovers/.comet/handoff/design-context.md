# Comet Design Handoff

- Change: fix-rename-leftovers
- Phase: design
- Mode: compact
- Context hash: b1498f5204bf9b201f606c7a4175b40cda1b958c6e489fd7c802df6e9e7330f9

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-rename-leftovers/proposal.md

- Source: openspec/changes/fix-rename-leftovers/proposal.md
- Lines: 1-16
- SHA256: 738f4aef488ce9747bfbd0074edc5569cf7ca6c828434b3547bd20ee4aaae080

```md
# Proposal: Fix Clash Party → Star Gazer Rename Leftovers

## Background
The project was forked and renamed from Clash Party to Star Gazer. Most core code was updated, but multiple files still contain old references (`mihomo-party`, `clashparty`, `Clash Party`).

## Scope
Fix all remaining references in:
- `src/` source code (db.ts, dns.ts, sysproxy.ts, theme.ts, override.tsx)
- `build/pkg-scripts/` (postinstall, preinstall)
- `scripts/` (telegram.mjs)
- `README.md`

## Key Decisions
- IndexedDB: migrate data from `clashparty_db` to `stargazer_db`
- theme-hub/override-hub: point to `markd3ng` forks
- macOS helper: align bundle ID from `party.mihomo` to `party.stargazer`
```

## openspec/changes/fix-rename-leftovers/design.md

- Source: openspec/changes/fix-rename-leftovers/design.md
- Lines: 1-40
- SHA256: 3d9de702f47dd5399406e59d4e14e09ba631e0dc8b1fb624370ea153c9260d4f

```md
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
```

## openspec/changes/fix-rename-leftovers/tasks.md

- Source: openspec/changes/fix-rename-leftovers/tasks.md
- Lines: 1-12
- SHA256: 6def29463baf845ba8bb2827114d638cd21ae2e6ed4e30d7348b455470a28080

```md
# Tasks

- [ ] 1. Fix `src/renderer/src/utils/db.ts`: add migration + rename DB
- [ ] 2. Fix `src/main/core/dns.ts`: update socket path
- [ ] 3. Fix `src/main/sys/sysproxy.ts`: update socket path + helper labels
- [ ] 4. Fix `build/pkg-scripts/postinstall`: update all mihomo-party references
- [ ] 5. Fix `build/pkg-scripts/preinstall`: update cleanup paths
- [ ] 6. Fix `src/main/resolve/theme.ts`: update theme-hub URL
- [ ] 7. Fix `src/renderer/src/pages/override.tsx`: update override-hub URL
- [ ] 8. Fix `scripts/telegram.mjs`: update display name + URLs
- [ ] 9. Fix `README.md`: update all links and references
- [ ] 10. Update `changelog.md`
```

