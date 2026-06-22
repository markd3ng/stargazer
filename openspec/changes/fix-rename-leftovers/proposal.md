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
